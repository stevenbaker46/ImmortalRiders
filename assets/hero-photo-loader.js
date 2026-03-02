(() => {
  async function loadHeroPhoto() {
    const heroPatch = document.getElementById('heroPatch');
    if (!heroPatch) return;
    try {
      const res = await fetch('assets/hero-photo.txt', { cache: 'force-cache' });
      if (!res.ok) return;
      const b64 = (await res.text()).trim();
      if (b64) heroPatch.src = `data:image/jpeg;base64,${b64}`;
    } catch (_) {
      // keep default patch image as fallback
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeroPhoto, { once: true });
  } else {
    loadHeroPhoto();
  }
})();
