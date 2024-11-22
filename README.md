# AirNES

**AirNES** is an open source air console that allows players to instantly turn their PC into a game console, using their smartphones and joysticks. It leverages the **Peer.js** library for LAN connectivity between host and players.

## Play now!

You don't need to install anything to play!

Just go to [nes.cosas.ar](https://nes.cosas.ar) from any device to host or join a game.

## Features

- **Peer-to-Peer LAN connection:** Connect to the host just by joining the same static webpage and being on the same Wi-Fi network.
- **Touch-Friendly Controller:** Fully interactive on mobile devices with touch controls.
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
   - For desktop users, you can customize the controller layout.

5. **Full-Screen Mode:**
   - Toggle the screen orientation by clicking the "Fullscreen" button.

## Controls

- **Mobile:** Touch-based controls on the screen.
- **Desktop:** Button mappings are handled through the UI (or optionally with a physical controller).

## Contributing

Contributions to **AirNES** are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a new Pull Request.

Please ensure that your code follows the style guide and includes tests where necessary.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Peer.js** for providing an easy-to-use peer-to-peer framework.
- **NES emulator** used in this project for running NES games in the browser.
- Inspiration and support from open-source emulator projects.

## Contact

For any issues or queries, please open an issue on the GitHub repository, or reach out to [your-email@example.com](mailto:your-email@example.com).

---

Enjoy playing NES games with friends in the cloud with **AirNES**!
