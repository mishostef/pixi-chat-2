# Pixi.js Exercise

## Chat Client

1. Setup application
- Download project files and setup libraries
- Import the Pixi library and create an application with 800x600 resolution, using color **0x4472c4** for the background. Add the application's view to the page
- Create an empty `update` function and add it to the application's **Ticker**

2. Load assets
- Use the application **Loader** to asynchronously import the three base images **inset.png**, **bevel.png** and **hover.png**
- Once all assets are done loading, the rest of the initialization code may be executed

3. Create texture tiles from base images
- Out of all three base images, create the following slices:
  - Top-left corner from **0,0** with size **25x25**
  - Top-right corner from **105,0** with size **25x25**
  - Bottom-left corner from **0,105** with size **25x25**
  - Bottom-right corner from **105,105** with size **25x25**
  - Top side from **25,0** with size **80x25**
  - Bottom side from **25,105** with size **80x25**
  - Left side from **0,25** with size **25x80**
  - Right side from **105,25** with size **25x80**
  - Center area from **25,25** with size **80x80**
- Collect the tiles into dictionaries for easier reference in other parts of the application
- When constructing an element, place the four corners as they. Stretch the top and bottom parts horizontally so they fill the area from corner to corner. Similarly stretch the left and right parts vertically. The center area is stretched both horizontally and vertically to fill the remaining gap. Alternatively, the side and center textures may be tiled, there will be no visual difference, but tiling takes more code to achieve.

4. Build application GUI
- Using the textures tiles, construct the following elements:
  - Text output area with size **750x475**
  - Text input area with size **575x50**
  - Blue button with size **150x50**
  - Orange button with size **150x50**
- Place each element in a container. We will be adding more elements to each container later. The two buttons should be in the same container
- Align the containers as follows:
  - Text output at **25,25**
  - Text input at **25,525**
  - Buttons at **625,525**

5. Create **Send** button
- Overlay the text ***Send*** inside the button. Make sure it appears on top of all contents in the container
- Make the orange version invisible on startup

6. Configure event listeners for the button
- Make the button container interactive
- Add event listeners for `mouseenter`, `mouseleave` and `pointertap`
  - When the mouse enters the container, make the orange version visible and the blue version invisible
  - When the mouse leaver the container, make the blue version visible and the orange version invisible
  - For the `pointertap` event add a placeholder callback (with a browser alert or console message)

7. Listen for text input
- Add an event listener to the document for the `keydown` event
- Create a data structure that holds the current input (a simple string will work)
- When the user enters any displayable character (such as letters, digits or symbols), add it to the input data structure. You may use ASCII codes, whitelist of characters or any other method you consider reasonable
- Add a special check for the `Backspace` key - when the user presses it, remove the last character from the data structure
- Add a special check for the `Enter` key - it should execute the same callback as clicking the **Send** button
- When the `Send` callback is executed, clear the input data structure and commit the current message to another data structure, holding all current messages (an array of strings might be sufficient)

8. Display text in the input area
- Create a new text element and add it to the input container
- Display the contents of the input data structure in this text element

9. Add text output
- Create a new text elemetn and add it to the output container
- Display the context of the messages data structure, each on a new line

10. Integrate WebSocket communication
- Use the techni`ues from previous exercises to make the chat work across a web server with multiple clients

11. **(BONUS)** Add a starting screen where the user may enter a nickname and room name