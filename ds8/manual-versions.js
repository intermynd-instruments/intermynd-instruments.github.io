const ds8ManualVersions = [
  {
    version: '0.8',
    path: 'ds8-manual-v0.8.html',
  },
  {
    version: '0.7',
    path: 'ds8-manual-v0.7.html',
  },
  {
    version: '0.6',
    path: 'ds8-manual-v0.6.html',
  },
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

const vitaFaceButtons = {
  CROSS: {
    className: 'vita-button-cross',
    label: 'Cross',
  },
  SQUARE: {
    className: 'vita-button-square',
    label: 'Square',
  },
  TRIANGLE: {
    className: 'vita-button-triangle',
    label: 'Triangle',
  },
  CIRCLE: {
    className: 'vita-button-circle',
    label: 'Circle',
  },
};

document.querySelectorAll('.manual-article code').forEach((code) => {
  const control = code.textContent.trim();
  const faceButton = vitaFaceButtons[control];

  if (!faceButton) {
    return;
  }

  const icon = document.createElement('span');
  icon.className = `vita-button-icon ${faceButton.className}`;
  icon.setAttribute('role', 'img');
  icon.setAttribute('aria-label', `${faceButton.label} button`);
  icon.setAttribute('title', `${faceButton.label} button`);
  icon.dataset.control = control;
  code.replaceWith(icon);
});
