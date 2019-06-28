import { a as patchBrowser, b as globals, c as bootstrapLazy } from './dom-portal-4fd39a76.js';

patchBrowser().then(resourcesUrl => {
  globals();
  return bootstrapLazy([["dom-portal",[[1,"dom-portal",{"portalId":[1538,"portal-id"],"container":[1],"projected":[516],"hosted":[4]}]]]], { resourcesUrl });
});
