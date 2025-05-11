const API_KEY = 'AIzaSyASzKiNCvroZb4wSPg0NPMu6NVdnMGxNOw';

async function getPlaylistData() {
  const url = document.getElementById('playlistUrl').value;
  const playlistId = getPlaylistId(url);
  if (!playlistId) {
    alert("Invalid playlist URL");
    return;
  }

  let videoIds = [];
  let nextPageToken = '';
  do {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${API_KEY}&pageToken=${nextPageToken}`);
    const data = await response.json();

    if (data.error) {
      alert("Error fetching playlist. Check API key or URL.");
      return;
    }

    videoIds.push(...data.items.map(item => item.contentDetails.videoId));
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  let durations = [];

  for (let i = 0; i < videoIds.length; i += 50) {
    const ids = videoIds.slice(i, i + 50).join(',');
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${API_KEY}`);
    const json = await res.json();

    json.items.forEach(item => {
      const duration = parseISO8601Duration(item.contentDetails.duration);
      durations.push(duration);
    });
  }

  const totalSeconds = durations.reduce((a, b) => a + b, 0);
  showResults(videoIds.length, totalSeconds);
}

function getPlaylistId(url) {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function parseISO8601Duration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function showResults(videoCount, totalSeconds) {
  const normal = totalSeconds;
  const speed15 = totalSeconds / 1.5;
  const speed2 = totalSeconds / 2;

  document.getElementById('results').innerHTML = `
    <p><strong>Total Videos:</strong> ${videoCount}</p>
    <p><strong>Total Time (1x):</strong> ${formatDuration(normal)}</p>
    <p><strong>At 1.5x Speed:</strong> ${formatDuration(speed15)}</p>
    <p><strong>At 2x Speed:</strong> ${formatDuration(speed2)}</p>
  `;
}
function showResults(videoCount, totalSeconds) {
  const normal = totalSeconds;
  const speed15 = totalSeconds / 1.5;
  const speed2 = totalSeconds / 2;

  const days = parseInt(document.getElementById("daysInput").value) || 0;

  document.getElementById('results').innerHTML = `
    <p><strong>Total Videos:</strong> ${videoCount}</p>
    <p><strong>Total Time (1x):</strong> ${formatDuration(normal)}</p>
    <p><strong>At 1.5x Speed:</strong> ${formatDuration(speed15)}</p>
    <p><strong>At 2x Speed:</strong> ${formatDuration(speed2)}</p>
  `;

  if (days > 0) {
    document.getElementById("perDayResults").innerHTML = `
      <p class="font-semibold">📅 To finish in <strong>${days} days</strong>:</p>
      <p>🕒 Daily Time (1x): ${formatDuration(normal / days)}</p>
      <p>⚡ Daily Time (1.5x): ${formatDuration(speed15 / days)}</p>
      <p>🚀 Daily Time (2x): ${formatDuration(speed2 / days)}</p>
    `;
  } else {
    document.getElementById("perDayResults").innerHTML = "";
  }
}

