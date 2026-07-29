import connectDB from '../server/config/db.js';
import Event from '../server/models/Event.js';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Allow only GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const eventId = req.query.id;
  
  if (!eventId || eventId.length !== 24) {
    // Invalid ID format, just redirect to home
    return res.redirect('/');
  }

  try {
    // 1. Connect to DB
    await connectDB();

    // 2. Fetch the specific event
    const event = await Event.findById(eventId).populate('organizer', 'name');

    if (!event) {
      return res.redirect('/');
    }

    // 3. Construct the dynamic Open Graph HTML
    // We will read the built index.html and inject our meta tags into the <head>
    // This way, bots get the tags and real users get the actual React app seamlessly.
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    let html = '';
    
    try {
      html = fs.readFileSync(indexPath, 'utf8');
    } catch (fsError) {
      console.error('Could not read dist/index.html:', fsError);
      return res.redirect('/');
    }

    const formattedDate = new Date(event.dateTime).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    const ogTitle = `${event.title} - Get-To-Gather`;
    const ogDescription = `Join ${event.organizer?.name || 'us'} on ${formattedDate} at ${event.location?.address?.split(',')[0]}. Spots limited!`;
    const ogImage = event.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
    const canonicalUrl = `https://gtg-mu.vercel.app/event/${event._id}`;

    const customMetaTags = `
      <!-- Dynamic Event OG Tags -->
      <meta name="title" content="${ogTitle}">
      <meta name="description" content="${ogDescription}">
      <meta property="og:type" content="website">
      <meta property="og:url" content="${canonicalUrl}">
      <meta property="og:title" content="${ogTitle}">
      <meta property="og:description" content="${ogDescription}">
      <meta property="og:image" content="${ogImage}">
      <meta property="twitter:card" content="summary_large_image">
      <meta property="twitter:url" content="${canonicalUrl}">
      <meta property="twitter:title" content="${ogTitle}">
      <meta property="twitter:description" content="${ogDescription}">
      <meta property="twitter:image" content="${ogImage}">
    `;

    // Inject just before </head>
    html = html.replace('</head>', `${customMetaTags}</head>`);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); 
    return res.status(200).send(html);

  } catch (error) {
    console.error('OG Tag Generator Error:', error);
    return res.redirect('/');
  }
}
