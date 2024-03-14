# ChatOverlay

A chat overlay combining chat messages from multiple platforms, written using Express.js and powered by the Streamer.bot websocket client.

# Overview

I hacked this little application together since I wanted to have a combined display of both Twitch and VStream chat on my stream.  It currently only supports those two platforms, however it should be trivially easy to add support for other streaming platforms supported by Streamer.bot, namely Youtube and Trovo.

# Requirements

- Node.js (whatever the latest LTS version is) and the latest version of the Yarn package manager
- A properly configured install of Streamer.bot, with the websocket server enabled
- Your own SSL/TLS certificate and key (and an understanding of how to make self-signed certs work in OBS, if that's what you plan on using)

1. Copy `.env-template` to `.env` and change the values to settings that make sense for your environment (90% of people will probably be fine with the defaults)
2. Copy your certificate (as `cert.pem`) and key (as `key.pem`) into the root folder of the application (should live in the same place as `index.js`)
2. Run `yarn` without any options to install the necessary modules
3. Run `yarn start` to start the application
4. Browse to https://localhost:port/ - if you did things right, you should see a black page
5. Make your customizations (see below), then add a Browser source in OBS that points to the URL of your overlay.

To test, pop into the chat for each of the platforms you use and type a test message.  You should see it pop up in the overlay.

# Overlay Configuration

The overlay page has two configuration options which you can set via the URL query string:

`align=left|right` - aligns the chat text to either the left or right side of the page.  If omitted, defaults to `left`.
`fade=true|false` - causes chat messages to fade after 15 seconds.  If omitted, defaults to `false`.

# Customization

Roughly 90% of the customization will happen in `static/style.css`.  You will definitely want to customize the font family and size out of the box, since it's unlikely that the defaults presented here will work.

For that last 10%, I recommend making a copy of the stock `index.html` and `style.css` files and making your edits in the new files.  Someone with more artistic talent than me could probably come up with some pretty wild customizations with this method.  The `lobby.html` is a rudimentary example of this in action.  Then all you 

# Troubleshooting

If something isn't working properly, either you don't have the websocket server in Streamer.bot turned on, there's an issue with the settings in `.env`, or something is fouled up with the way the SSL cert is set up which is causing the OBS browser source to freak out (this especially happens when you're dealing with 'localhost').

For the SSL cert issues, using self-signed certs in OBS can be problematic at the best of times.  You might want to look into something like [minica](https://github.com/jsha/minica) to help work around some of those cert complexities.

If you run into something other than the issues described above, create an issue and I'll try to help if I can.

# Disclaimers

Use at your own risk.  I wrote this for me, so I make no guarantees that it'll work for you.  Also be aware that certain platforms terms of service may place restrictions on combined chats, so do your due diligence before using this.
