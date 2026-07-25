const ds8ManualVersions = [
  {
    version: '0.5',
    path: 'ds8-manual-v0.5.html',
  },
];

const manualVersionSelect = document.getElementById('manual-version');

if (manualVersionSelect && ds8ManualVersions.length > 0) {
  const currentManual = manualVersionSelect.dataset.currentManual;
  const siteRoot = manualVersionSelect.dataset.siteRoot || '';
  const latestVersion = ds8ManualVersions[0].version;
  const latestOption = document.createElement('option');
  const versionGroup = document.createElement('optgroup');

  latestOption.value = `${siteRoot}ds8/manual.html`;
  latestOption.textContent = `Latest (v${latestVersion})`;
  latestOption.selected = currentManual === 'latest';

  versionGroup.label = 'Versioned manuals';

  ds8ManualVersions.forEach((manual) => {
    const option = document.createElement('option');
    option.value = `${siteRoot}${manual.path}`;
    option.textContent = `v${manual.version}`;
    option.selected = currentManual === manual.version;
    versionGroup.append(option);
  });

  manualVersionSelect.replaceChildren(latestOption, versionGroup);
  manualVersionSelect.addEventListener('change', () => {
    window.location.assign(manualVersionSelect.value);
  });
}
