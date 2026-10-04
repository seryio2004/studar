import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverMoodleReviews,readMoodleReview,resolvedReviewIds,deleteMoodleReview} from '../src/moodle.js';

const hash='a'.repeat(64);
test('discovery validates and orders dynamically listed review paths',async()=>{
  const fetcher=async(path,options)=>{
    assert.equal(path,'api/moodle-reviews');assert.equal(options.cache,'no-store');
    return {ok:true,json:async()=>({reviews:[{path:'imports/moodle/2026-10-04/proposals.json',sha256:hash},{path:'imports/moodle/2026-10-03/proposals.json',sha256:hash}]})};
  };
  const reviews=await discoverMoodleReviews(fetcher);
  assert.equal(reviews[0].path,'imports/moodle/2026-10-03/proposals.json');
  await assert.rejects(discoverMoodleReviews(async()=>({ok:true,json:async()=>({reviews:[{path:'https://outside.example/proposals.json',sha256:hash}]})})),/inválido/);
  await assert.rejects(discoverMoodleReviews(async()=>({ok:false})),/npm run dev/);
});
test('review reads reject partial JSON, HTTP errors and oversized files',async()=>{
  await assert.rejects(readMoodleReview('review',async()=>({ok:true,text:async()=>'{'})),SyntaxError);
  await assert.rejects(readMoodleReview('review',async()=>({ok:false})),/cargar/);
  await assert.rejects(readMoodleReview('review',async()=>({ok:true,text:async()=>' '.repeat(5*1024*1024+1)})),/5 MB/);
});

test('cleanup eligibility requires every imported source id to have a saved decision',()=>{
  const file={references:{source1:'one',source2:'old'}};
  const state={aiProposals:[{id:'one',status:'accepted'},{id:'latest',status:'pending',previousVersions:[{id:'old'}]}]};
  assert.equal(resolvedReviewIds(state,file),null);
  state.aiProposals[1].status='discarded';
  assert.deepEqual(resolvedReviewIds(state,file),['source1','source2']);
  assert.equal(resolvedReviewIds(state,{references:{}}),null);
  assert.equal(resolvedReviewIds({aiProposals:[]},file),null);
});
test('cleanup requests identify the exact file version and all original ids',async()=>{
  const path='imports/moodle/2026-10-04/proposals.json';
  const removed=await deleteMoodleReview(path,{sha256:hash},['one'],async(url,options)=>{
    assert.equal(url,'api/moodle-reviews/cleanup');assert.equal(options.method,'POST');
    assert.deepEqual(JSON.parse(options.body),{path,sha256:hash,resolved_ids:['one']});
    return {ok:true,json:async()=>({deleted:[path]})};
  });
  assert.deepEqual(removed,[path]);
  await assert.rejects(deleteMoodleReview(path,{sha256:hash},[],async()=>({ok:false,json:async()=>({error:'La revisión ha cambiado'})})),/cambiado/);
});
