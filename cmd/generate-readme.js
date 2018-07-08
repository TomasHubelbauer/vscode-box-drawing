const fs = require('fs-extra');

void async function () {
  const template = String(await fs.readFile('README.template.md'));
  const features = String(await fs.readFile('demo/README.md'));
  await fs.writeFile('README.md', template.replace('## Features', features.replace(/\]\(/g, '](demo/')));
}()
