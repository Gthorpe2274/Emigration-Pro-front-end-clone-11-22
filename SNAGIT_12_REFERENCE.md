# Snagit 12.3 Reference (Windows)

> Future-use reference for the Snagit 12 installation on this computer. Based primarily on TechSmith's *Snagit 12 Help*, version 12.3.0 (February 2015). Menu names and capabilities differ substantially in newer Snagit releases.

## What Snagit 12 consists of

- **Capture Window / OneClick widget:** Starts image, video, or saved-profile captures. It normally collapses to a thin blue strip along the top, left, or right edge of the screen and expands when the pointer hovers over it.
- **Snagit Editor:** Previews, edits, organizes, saves, prints, and shares image and video captures.
- **Snagit Library:** Automatically stores captures and lets the user find them by date, application, website, flags, or tags.
- **Snagit Printer:** A virtual printer that turns printable content into image files or electronic documents.

## Capture Window / hidden widget

The widget seen at the upper-right of this computer contains a large red **Capture** button, **Editor**, **Settings**, **Capture Profiles**, **Image**, **Video**, **Send to Word**, **Send to Clipboard**, and **Manage Profiles**.

- Hover over the thin blue edge bar to expand it.
- Drag the expanded widget to reposition it along the top or either side of the screen.
- Click the red button for the current/default capture.
- Open the profile list and select a named profile for a capture with saved settings.
- Use the gear/additional-options control for preferences, help, and related commands.
- Open **Manage Profiles** to add, edit, group, import, export, reorder, or assign hotkeys to profiles.

Important: the widget's plain Capture button uses its own default All-in-One behavior. To guarantee a particular selection, effect, destination, or hotkey, invoke a saved profile.

## Capture types

### Image capture

Starts with the red Capture button or global hotkey (normally **Print Screen**). Orange crosshairs then allow:

- **All-in-One:** Dynamically choose full screen, a window, a rectangular region, or supported scrolling content.
- **Region:** Drag a rectangular area.
- **Window:** Hover until the desired window is outlined, then click.
- **Full Screen:** Capture the entire display.
- **Scrolling Window (the full-page mode):** From the normal Image/All-in-One capture, hover over a supported browser or application and click Snagit's vertical, horizontal, or all-direction scrolling arrow. For a webpage, the vertical arrow is the mode intended to capture automatically from the current top position through the bottom of the page.
- **Custom Scroll (partial-area alternative):** This is **not** the automatic full-page command. It is a profile type for selecting a specific vertical area inside a scrolling window—useful for excluding navigation, margins, ads, or other side content, or for capturing a scrolling frame. After drawing the area, click the real down-arrow on the target window's vertical scrollbar to make Snagit scroll that selected strip.
- **Scrolling Region (manual-stop alternative):** Select a specific scrolling area and control when the capture ends. It is intended for stopping before comments, ads, or other unwanted material rather than automatically capturing the whole page.
- **Free Hand:** Draw an irregular closed capture boundary.
- **Multiple Area:** Select several separate regions in one capture.
- **Fixed Region:** Capture an exact, predefined pixel size and/or location.
- **Repeat last area / same-size captures:** Reuse dimensions to make consistently sized captures.
- **Menu capture:** Use a timed delay so a dropdown or cascading menu can be opened before capture.
- **Scanner or Camera:** Acquire from a connected TWAIN-compatible device.

Common image options include showing the cursor, previewing in Editor, capturing layered windows, including multiple monitors, and applying an effect or output automatically through a profile.

### Video capture

- Select a window or draw a recording region.
- Record screen action to **MP4**.
- Record microphone audio, system audio, or both when the hardware and Windows configuration support them.
- Start, pause/resume, and stop the recording using the on-screen controls or configured hotkeys.
- The finished recording opens in Editor for preview, saving, and sharing.
- Snagit 12 provides basic playback and sharing; use Camtasia Studio for substantial video editing or effects.

### Timed capture

- **Delay capture:** Wait a specified number of seconds, useful for menus and transient UI.
- **Scheduled capture:** Run a saved capture profile at a selected date and time and send it to the profile's configured output.

### Printer capture

Choose **Snagit 12** as the printer from any application that can print. This can:

- Convert printable content to standard image or document formats.
- Capture multipage documents.
- Save pages together or as individual image files.
- Apply output settings, borders, frames, watermarks, and other effects.
- Create multiple named virtual-printer profiles with different layouts, paper settings, formats, effects, and destinations.

## Profiles

A profile stores five main things: **capture type, selection mode, effects, sharing destination, and hotkey**.

Built-in Capture Profiles:

- **Image:** All-in-One image capture.
- **Video:** Screen and audio recording to MP4.
- **Send to Word:** Capture and insert into Microsoft Word.
- **Send to Clipboard:** Capture and place on the Windows clipboard.

Time-saving profiles may include **Send to Google Drive**, **Delayed Menu Capture**, **Get a Link – Image**, and **Get a Link – Video**.

Profile management supports:

- Create, rename, edit, duplicate/save-as, and delete profiles.
- Set selection properties, effects, output properties, preview behavior, and timed capture.
- Assign a unique profile hotkey.
- Create, rename, delete, and reorder profile groups.
- Reorder profiles within groups.
- Import/export individual profiles or groups as **.SNAGPROF** files.

### Important distinction between the scrolling profiles

The entries under the installed **Scrolling Profiles** group are alternative/manual techniques; clicking a profile may first display a **Snagit Tip** explaining the interaction. In particular, the installed **Custom Scroll** entry does not itself mean “capture the full webpage.” Its tip instructs the user to select a custom area and then click the target window's own vertical-scrollbar down-arrow.

For an automatic top-to-bottom webpage capture, use the ordinary **Image** profile (Selection: **All-in-One**) and choose Snagit's vertical scrolling arrow when it appears over the browser. Snagit 12 officially documents automatic scrolling support for **Chrome, Firefox, and Internet Explorer**. Brave is not on that legacy compatibility list, even though it is Chromium-based, so automatic full-page scrolling may fail or behave inconsistently there.

**Where All-in-One appears:** All-in-One is a **Selection setting**, not a named item in the widget's profile list. In **Manage Profiles**, select **Image** (or create a new image profile), then open the **Selection** dropdown in the settings panel at the bottom. All-in-One should be a top-level selection value, not an item under Advanced. Therefore, not seeing “All-in-One” beside Image, Video, Send to Word, and other profile names is normal. If it is absent from the Selection dropdown itself, the installation/profile configuration is abnormal.

**Modern-browser warning:** The Snagit 12.3 manual's Chrome/Firefox support statement was written in 2015. It does not establish compatibility with browser releases from 2026. Automatic scrolling depends on legacy browser/window integration that may fail across all current browsers. Custom Scroll also expects a conventional scrollbar with a clickable down-arrow; many modern browsers use arrowless overlay scrollbars, so that fallback can fail as well.

## Snagit Editor

### Workspace

- **Canvas:** Displays the selected capture for editing or playback.
- **Open Captures Tray:** Shows recent images, videos, and opened files; thumbnail sizes can be changed.
- **Quick Access Toolbar:** Frequently used commands can be added or removed.
- **Styles Gallery:** Preset visual styles for tools and image effects.
- **Mini Toolbar:** Quick properties for a selected vector object; can be disabled in Editor Options.
- **Zoom and pan:** Change magnification without changing image dimensions.
- **Canvas background:** Change the Editor workspace color for contrast; it is not part of the saved image.

Unsaved captures are automatically retained as editable **SNAG** captures. An orange sunburst on a tray thumbnail indicates unsaved changes. Use **Save** or **Save As** for a named file.

### Selection and object operations

- Rectangle, ellipse, freehand, and polygon selections.
- Cut, copy, paste, delete, move, duplicate, and crop selected pixels.
- Move and resize editable vector objects.
- Arrange objects with bring forward/send backward and alignment commands.
- Group/ungroup where supported.
- **Flatten** an object or flatten all objects to merge them permanently into the image.
- Combine multiple images on one canvas by copying, pasting, and arranging them.
- Resize the image proportionally or independently; adjust pixels, percent, print dimensions, and resolution.
- Resize or trim the canvas separately from the image.

### Drawing and annotation tools

- **Selection:** Select pixels for moving, copying, deleting, cropping, or effects.
- **Arrow:** Straight, curved, and custom vector arrows.
- **Stamp:** Apply symbols from stamp collections.
- **Pen:** Freehand drawing.
- **Highlight:** Emphasize content with translucent strokes or regions.
- **Blur:** Conceal or de-emphasize content using smooth blur or pixelation.
- **Text:** Add editable text boxes.
- **Callout:** Add text inside speech, thought, or label shapes.
- **Line:** Draw straight or styled lines.
- **Shape:** Add rectangles, ellipses, polygons, and other preset shapes.
- **Fill:** Replace a contiguous color area.
- **Erase:** Remove image pixels or portions of objects.
- **Step:** Add automatically incrementing numbered or lettered markers.

Tool properties may include color, outline, width, end style, fill, font, size, shadow, opacity, antialiasing, and callout padding. The eyedropper can sample colors directly from the canvas. Custom combinations can be saved in the Styles Gallery.

### Image effects and filters

- Border.
- Shadow, page curl, perspective, and shear.
- Edge effects such as torn, wave, fade, and similar treatments.
- Watermark using an image file, with placement and transparency controls.
- Color effects such as grayscale, sepia, invert, and color adjustment.
- Filters such as sharpen, soften, and related whole-image processing.
- Batch conversion to apply effects and/or convert multiple files.

Image-tab effects apply to the whole canvas and are unavailable for video. For a local effect, select an area first when the command supports selections.

## Files, formats, and organization

- **SNAG:** Snagit 12's editable native capture format; preserves editable objects.
- Common image exports include PNG, JPG/JPEG, GIF, BMP, TIFF, PDF, and other formats exposed by Save As/export options.
- Video capture uses MP4.
- Saving to a flat format generally merges editable objects; keep a SNAG copy when future editing matters.
- File-format options can control color depth, compression/quality, transparency, metadata, and PDF page setup where supported.
- Automatic filenames can combine text with components such as date, time, computer name, and sequence values, and can warn before overwrite.

### Library

- Automatically retains unsaved captures.
- Browse and search by date, source application, website, flag, and assigned tags.
- Apply tags or flags to organize captures.
- Import local files, Google Drive files, or configured **My Places** locations.
- Export captures to local folders or My Places.
- Back up automatically stored captures to a **.SNAGARCHIVE** file.
- Restoring a SNAGARCHIVE replaces the current automatically stored library, so back up the current library first.

## Sharing outputs

Availability depends on capture type and installed/configured services:

- **Email:** Create a message through a supported desktop email client.
- **FTP:** Upload using configured FTP server details.
- **Program:** Open/send the capture to another compatible installed program.
- **Clipboard:** Copy for pasting elsewhere.
- **Microsoft Word, Excel, PowerPoint, OneNote 2013:** Insert into a document, workbook, slide, or notebook.
- **Camtasia Studio:** Send images or videos as project media for further editing.
- **YouTube:** Upload video.
- **Screencast.com:** Upload and receive a URL/embed code.
- **Google Drive:** Upload images/videos and copy a link.
- **Dropbox:** Upload images/videos and copy a link.
- **TechSmith Relay:** Upload to a configured Relay account.
- **My Places / OneDrive for Business:** Store in a configured place.
- **Accessories Manager:** Install additional output accessories that were available for this version.

Cloud services and old output accessories may no longer authenticate or operate because Snagit 12 is legacy software and service APIs have changed.

## Preferences

Capture and Editor preferences cover areas such as:

- Start Snagit with Windows and keep it available in the notification area.
- Show/hide or relocate the Capture Window widget.
- Global and profile hotkeys, including conflict handling.
- Capture cursor, preview-in-Editor behavior, notifications, and sound effects.
- Video/audio devices and recording quality.
- Editor appearance, workspace background, Open Captures Tray, Mini Toolbar, and save behavior.
- Default file format and file-format-specific options.
- Printer Capture settings.
- Library location and backup/restore of automatically stored captures.
- Program updates, account access, and installed sharing accessories.

## High-value keyboard commands

Defaults can be changed and may conflict with OneDrive, Dropbox, or other screenshot utilities.

- **Print Screen:** Start a capture with the active/global capture settings.
- **Ctrl+O:** Open a file in Editor.
- **Ctrl+N:** New image.
- **Ctrl+S:** Save.
- **Ctrl+Shift+S:** Save all.
- **Ctrl+Z / Ctrl+Y:** Undo / redo.
- **Ctrl+X / Ctrl+C / Ctrl+V:** Cut / copy / paste.
- **Ctrl+A:** Select all.
- **Ctrl+Shift+C:** Copy all.
- **Ctrl+Shift+F / Ctrl+Shift+B:** Bring forward / send backward.
- **Ctrl+T / Ctrl+Shift+T:** Flatten selected / flatten all.
- Press **Alt** in Editor to reveal ribbon access keys.

For exact capture, video, and profile hotkeys on this computer, inspect **Capture Window > Preferences > Hotkeys** and each profile's assigned hotkey; user customization can make documentation defaults inaccurate.

## Practical recipes

### Capture a normal region

1. Hover over the thin blue widget strip.
2. Choose **Image** or a region profile.
3. Drag around the desired area.
4. Annotate in Editor, then save or share.

### Capture a long web page

1. For Snagit 12, open the page in **Chrome, Firefox, or Internet Explorer**. Do not assume Brave is compatible with Snagit 12's legacy scrolling detector.
2. Scroll the page to the top and close menus, Find boxes, dialogs, or other pop-ups that may have focus.
3. Start the ordinary **Image** profile with Selection set to **All-in-One**.
4. Move the orange crosshairs over the browser content. Snagit should outline the window and display scrolling arrows.
5. Click Snagit's **vertical scrolling arrow** for an automatic top-to-bottom capture. This is the full-page workflow.
6. Use **Custom Scroll** only when you want a narrower vertical strip or a scrolling frame: draw the area, release, then click the browser window's own vertical-scrollbar down-arrow.
7. Use **Scrolling Region** when you want to choose where the scrolling capture stops.
8. If no scrolling arrow appears in a supported browser, verify that the page is genuinely scrollable, remove pop-ups/focus conflicts, and try the two alternative scrolling profiles. Protected PDFs and some application frameworks may remain unsupported.

### Capture an open menu

1. Use the built-in **Delayed Menu Capture** profile or create a timed profile.
2. Start the capture and open the menu during the countdown.
3. Select the menu region when capture begins.

### Repeated identical-size captures

Create a profile with **Fixed Region** dimensions, or reuse the last capture area, then assign a profile hotkey.

### Preserve editability and make a shareable copy

Save a master as **SNAG**, then use Save As/export for PNG, JPG, PDF, or another delivery format.

## Version boundaries

Do not assume tutorials for Snagit 2024–2026 match Snagit 12. Features associated with newer releases—such as modern Grab Text/OCR workflows, Panoramic Capture, Simplify, Smart Move, templates, animated GIF creation, webcam picture-in-picture, Screen Draw, Step Capture, Smart Redact, cloud SNAGX workflows, and newer sharing destinations—may be absent or behave differently in Snagit 12.

## Primary sources

- [TechSmith Snagit 12.3 Help PDF](https://assets.techsmith.com/Docs/pdf-snagit/Snagit_12.3_Help.pdf)
- [TechSmith: Turn the OneClick Capture Widget on or off](https://support.techsmith.com/hc/en-us/articles/203731798-Turn-OneClick-Capture-Widget-On-or-Off-in-Snagit)
- [TechSmith: Capture modes in Snagit Windows](https://support.techsmith.com/hc/en-us/articles/360002743452-Capture-Modes-in-Snagit-Windows)
- [TechSmith: Hotkey problems and questions](https://support.techsmith.com/hc/en-us/articles/203731558-Hotkey-Problems-and-Questions-in-Snagit)

Last researched: 2026-09-02.
