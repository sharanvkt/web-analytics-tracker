# Web Analytics Tracker

A lightweight web analytics tracking script that works with Appwrite backend.

## Usage

Add this script to your website:

```html
<script>
  (function(w,d,s,e,p){
    var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s);
    j.async=true;
    j.src='https://cdn.jsdelivr.net/gh/yourusername/web-analytics-tracker@latest/dist/analytics-tracker.min.js';
    j.onload=function(){w.analyticsTracker.init(e,p)};
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','YOUR_APPWRITE_ENDPOINT','YOUR_PROJECT_ID');
</script>
```

## Features

- Page view tracking
- Time on page tracking
- Session management
- Lightweight and async loading
- Works with Appwrite backend

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build: `npm run build`

## License

MIT