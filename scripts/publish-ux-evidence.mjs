// Publish synthetic UI evidence to a separate immutable-per-run branch.
import fs from 'node:fs/promises';
const repo=process.env.GITHUB_REPOSITORY,token=process.env.GH_TOKEN,run=process.env.GITHUB_RUN_ID;
if(!repo||!token||!/^\d+$/.test(run||''))throw Error('GitHub Actions context required');
const root=process.argv[2]||'evidence/visual-preview';
async function api(path,body){const r=await fetch('https://api.github.com/repos/'+repo+path,{method:'POST',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify(body)});const value=await r.json();if(!r.ok)throw Error(r.status+' '+JSON.stringify(value));return value}
const entries=[];
for(const name of await fs.readdir(root)){if(!/\.(png|json|txt)$/.test(name))continue;const data=await fs.readFile(root+'/'+name);const blob=await api('/git/blobs',{content:data.toString('base64'),encoding:'base64'});entries.push({path:name,mode:'100644',type:'blob',sha:blob.sha})}
if(!entries.length)throw Error('No evidence');
const tree=await api('/git/trees',{tree:entries});
const commit=await api('/git/commits',{message:'Synthetic UX evidence for '+process.env.GITHUB_SHA,tree:tree.sha,parents:[]});
const branch='qa/ux-evidence-'+run+'-'+(process.env.GITHUB_JOB||'screens');
await api('/git/refs',{ref:'refs/heads/'+branch,sha:commit.sha});
console.log('UX_EVIDENCE_BRANCH='+branch);
console.log('UX_EVIDENCE_COMMIT='+commit.sha);
