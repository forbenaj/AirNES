# AirNES

**AirNES** is an open source *air console*⁽¹⁾ that allows players to instantly turn their PC into a game console, using their smartphones as joysticks. It leverages the **Peer.js** library for LAN connectivity between host and players, and currently uses the **JSNES** emulator.

## Play now!

You don't need to install anything to play!

Just go to [nes.cosas.ar](https://nes.cosas.ar) from any device to host or join a game.

## Features

- **Peer-to-Peer LAN connection:** Connect to the host just by joining the same static webpage and being on the same Wi-Fi network.
- **Use your phone as a controller:** Open the same webpage on your phone and use it as a controller.
- **ROM Upload and Management:** Upload any ROM and have them always at hand.
- **Cross-Device Play:** Works on both desktop and mobile devices, either as host or as player.

## Installation

To run **AirNES** locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/forbenaj/AirNES.git
   cd AirNES
   
2. Run the `index.html` in a local server. You can use the Live Server extension in VS Code.

3. From the devices that will be used as joysticks (usually smartphones), you can join the server by entering your IPV4 and the port number.

**AirNES** runs directly in the browser, so no additional setup or installation is required. Ensure all devices are in the same network.

## Usage

1. **Host a Game:**
   - Enter a unique host name and click "Host".
   - Once connected, show your host name to the players so they can join.

2. **Join a Game:**
   - Enter the host's name and click "Join".
   - Upon a successful connection, the host will display the connected players, and you’ll be able to control the console.

3. **Upload a ROM:**
   - Click the "Upload Rom" button and select a valid NES ROM file.
   - Once the ROM is loaded, click "Start Emulator" to begin the game.

4. **Controller:**
   - Use the on-screen buttons on mobile or touch-enabled devices.

5. **Full-Screen Mode:**
   - Toggle the screen orientation and full screen by touching the "Mode" button.

## Contributing

Contributions to **AirNES** are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a new Pull Request.

## Acknowledgments

- [**Peer.js**](https://github.com/peers/peerjs) an easy-to-use peer-to-peer framework.
- [**JSNES**](https://github.com/bfirsh/jsnes) used in this project for running NES games in the browser.
- Thanks to [**AirConsole**](https://www.airconsole.com/) for creating the concept of an air console, sorry no sorry for trying to make a free and open-source alternative!

## Contact

For any issues or queries, please open an issue on the GitHub repository.

# Future

AirNES is a proof of concept, not intended to be a copy or replacement to AirConsole, but a fun little project to play with friends anywhere.<br>
⁽¹⁾ I find it hard to come up with a name for this kind of console other than "air console". I haven't seen a gaming platform with this form factor anywhere else other than AirConsole, and I think the name suits the concept well. Suggestions are appreciated.

I feel that recently, video game and console design has shifted away from shared-screen experiences, prioritizing online multiplayer where you don't need to be in the same room to play. Social 'party' experiences are becoming increasingly rare, and especially difficult to pull off with portable devices ([DIY Perks makes an excellent point about this](https://www.youtube.com/watch?v=W4PHhurAhwc)).

A console of this kind is just meant to be an addition to the scarce and unpopular list of modern party games, and has no other purpose than to try and bring people together. Physically.

That's why all my efforts will be focused on making this project as easy to use as possible, and accessible to everyone. You should be able to open nes.cosas.ar from any device, and play immediately with as little friction as possible. And it should be easy enough to create games for it or add new consoles.

## Opensourceness

I encourage all creators to:

- Add new emulators to the project.
- Create games specifically targeted for the project.
- Add features, fix bugs, suggest modifications, etc.
- Create your own version of the project.

### Creating for AirNES

The first thing that comes up when trying to play a game using a smartphone as a joystick, is the lack of tactile feedback. You don't know what the heck you're pressing, and you can't look at the controller as you look at the screen. So games for a console of this kind should be designed with this in mind.

- NES games are perfect for this, because they have minimum controls, and I designed the joystick with some big ass buttons you can't miss.
- AirConsole games are also designed with minimum controls, or in a way that you can look at the phone screen without missing anything.

Overall, games should be designed either with few inputs and big buttons, or with a non-realtime dynamic (like trivia games).
A good idea is to include race games with automatic acceleration, so it's either left or right, or games with single-button inputs, like those Digital Chocolate classics.

### Helping with the project

You can look at this list to have an idea of what I'm working on, what I need help with, and what are my ideas for the future:

- [ ] Fix view when hosting from phone
- [ ] Make game selection list work
  - [ ] Add cache

- [ ] Add vibration to the controller
- [ ] Add other emulators
  - [ ] Nintendo 64
  - [ ] Game Boy
  - [ ] PlayStation
- [ ] Add controller mapping
- [ ] Add fullscreen

AirConsole let's you play the game even if you're not in the same network, with insanely low latency. I don't know how they do it, but I need that.
- [ ] Add that shit

The NES emulator has a few issues, and it may be the way I implemented it, but also it would be good to try some others. I've played browser emulators with no issues at all, but mine for some reason is terribly laggy and performance-heavy.
- [ ] Fix delayed audio
- [ ] Fix framerate
When you press a button too quickly, it doesn't register. I added a timer fix, but it's a little hacky
- [ ] Fix unrecognized input

PeerParty is a thingy I tried to implement for a previous project.
Instead of having to use a hostname, the users would see a list of active hosts, and connect to them by selecting one, or host a game themselves.
The problem is that Peer.js doesn't have any way to advertise a peer, you need to add have the peer id to connect to it.
So I did a hacky thing, where when you open the app, it tries to create a peer with a number (starting by 14 for some reason), and if it fails, it tries to create it with the next one, until it finds one that works. All those previous attempts are then displayed as a list of peers to connect to, because it means they are taken by other devices.
This could be probably solved if I used WebRTC directly, but I'm not sure how to do that. Any way, it's either adapting the hacky thing and making it work, or coming up with a WebRTC solution.
- [ ] Implement PeerParty