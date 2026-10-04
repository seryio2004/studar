import importlib.util
import hashlib
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('studydev', Path(__file__).resolve().parents[1] / 'scripts/dev.py')
dev = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dev)


class ReviewDiscoveryTest(unittest.TestCase):
    def read_index(self):
        handler = object.__new__(dev.ProjectHandler)
        handler.path = '/api/moodle-reviews?refresh=1'
        handler.wfile = io.BytesIO()
        headers = {}
        handler.send_response = lambda status: self.assertEqual(status, 200)
        handler.send_header = lambda name, value: headers.update({name: value})
        handler.end_headers = lambda: None
        handler.do_GET()
        self.assertEqual(headers['Cache-Control'], 'no-store')
        return json.loads(handler.wfile.getvalue())['reviews']

    def test_new_and_replaced_files_are_detected_without_restarting(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(dev, 'ROOT', Path(tmp)):
            self.assertEqual(self.read_index(), [])
            path = Path(tmp) / 'imports/moodle/2026-10-05/proposals.json'
            path.parent.mkdir(parents=True)
            path.write_text('{"schema_version":1,"proposals":[]}', encoding='utf-8')
            first = self.read_index()
            self.assertEqual(first[0]['path'], 'imports/moodle/2026-10-05/proposals.json')
            path.write_text('{"schema_version":1,"proposals":[],"complete":true}', encoding='utf-8')
            self.assertNotEqual(self.read_index()[0]['sha256'], first[0]['sha256'])
            invalid = path.parent.parent / 'aaaa-bb-cc/proposals.json'
            invalid.parent.mkdir()
            invalid.write_text('{}')
            self.assertEqual(len(self.read_index()), 1)
            path.unlink()
            self.assertEqual(self.read_index(), [])


class ReviewCleanupTest(unittest.TestCase):
    def create_review(self, root):
        folder = root / 'imports/moodle/2026-10-04'
        folder.mkdir(parents=True)
        path = folder / 'proposals.json'
        path.write_text(json.dumps({'schema_version': 1, 'proposals': [{'id': 'one'}, {'id': 'two'}]}))
        return folder, {'path': path.relative_to(root).as_posix(),
                        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                        'resolved_ids': ['one', 'two']}

    def test_cleanup_deletes_only_json_in_the_resolved_review(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(dev, 'ROOT', Path(tmp)):
            root = Path(tmp)
            folder, payload = self.create_review(root)
            (folder / 'inventory.json').write_text('{}')
            (folder / 'history').mkdir()
            (folder / 'history/previous.json').write_text('{}')
            (folder / 'resources').mkdir()
            (folder / 'resources/manifest.json').write_text('{}')
            (folder / 'resources/source.pdf').write_bytes(b'Original document')
            (folder / 'resumen.md').write_text('Resumen')
            other = folder.parent / '2026-10-05'
            other.mkdir()
            (other / 'proposals.json').write_text('{}')
            deleted = dev.remove_resolved_review(payload)
            self.assertEqual(len(deleted), 4)
            self.assertEqual(deleted[-1], payload['path'])
            self.assertFalse(list(folder.rglob('*.json')))
            self.assertTrue((folder / 'resources/source.pdf').exists())
            self.assertTrue((folder / 'resumen.md').exists())
            self.assertTrue((other / 'proposals.json').exists())
            self.assertEqual(dev.remove_resolved_review(payload), [])

    def test_unresolved_or_changed_reports_are_not_deleted(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(dev, 'ROOT', Path(tmp)):
            folder, payload = self.create_review(Path(tmp))
            with self.assertRaisesRegex(ValueError, 'resolver'):
                dev.remove_resolved_review({**payload, 'resolved_ids': ['one']})
            self.assertTrue((folder / 'proposals.json').exists())
            (folder / 'proposals.json').write_text('{"proposals": [{"id": "new"}]}')
            with self.assertRaisesRegex(ValueError, 'cambiado'):
                dev.remove_resolved_review(payload)
            self.assertTrue((folder / 'proposals.json').exists())

    def test_paths_and_symlinks_cannot_delete_unrelated_json(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(dev, 'ROOT', Path(tmp)):
            root = Path(tmp)
            folder, payload = self.create_review(root)
            for path in ['../proposals.json', 'src/data.json', 'imports/moodle/2026-10-04/../proposals.json']:
                with self.assertRaises(ValueError):
                    dev.remove_resolved_review({**payload, 'path': path})
            outside = root / 'outside.json'
            outside.write_text('{}')
            (folder / 'linked.json').symlink_to(outside)
            with self.assertRaisesRegex(ValueError, 'enlazados'):
                dev.remove_resolved_review(payload)
            self.assertTrue(outside.exists())
            self.assertTrue((folder / 'proposals.json').exists())
