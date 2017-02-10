## Specification

  1. Transform a comment with an association tag to a box.
  2. Add an "associate" link to user's tools under questions that do not have association. By clicking on the comment menu should expand with the tag inside. After an association has been sent, the comment should automatically transform according 1.1.
  3. Users should have ability to edit or delete an association.


## Supporting Browsers

We are planning to support a few major browsers. As I understood Opera and Firefox have migrated to Chromium open source project. It means that they use the same extension mechanism as Google Chrome. I've tested the extention last time in

- Google Chrome, Mac OS X, v55.0.2883.95 64-bit
- Opera, Mac OS X, v42.0.2393.137 64-bit
- Firefox, Mac OS X, v50.1.0 64-bit

## How To Install

We suggest use an "unpacked" version of the extension right from a folder with the code. Checked out the code from GitHub and use an extension folder as a root directory for the uploading to a browser.

- Chrome: https://developer.chrome.com/extensions/getstarted#unpacked
- Opera: https://dev.opera.com/extensions/testing/
- Firefox: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Your_first_WebExtension#Trying_it_out

## Implementation

At the time of writing, we implemented the basic functionality of the web extension including

- Parsing comments with the association tag. Comments are fetching from SE by API.
- Adding a box if an association is found in comments.
- Adding an "associate" link in the user's mod tools under question body. By clicking on the link the add comment menu is expanded and the association tag automatically put in the text area.

### Association Format

Currently we use the following format

__For Stack Overflow in Russian__

    ассоциация: ссылка_на_вопрос_на_английском
    
For exmaple, `ассоциация:http://stackoverflow.com/questions/3211771/how-to-convert-int-to-qstring`

### Showcase

After adding the extension comments with associations will look like this

![](https://i.stack.imgur.com/heLd6.png)

The second part is the "association" link.

![](https://i.stack.imgur.com/DtoWV.png)

By clicking on which an input field will expand. Add the link to the associated question on Stack Overflow in English and click "Associate".

![](https://i.stack.imgur.com/jWVhh.png)
