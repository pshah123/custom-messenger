let DEBUG = true

const electron = require('electron')
const { app, BrowserWindow, Tray, Menu } = require('electron')
const shortcut = require('electron-localshortcut')
const shell = require('electron').shell
const path = require('path')
let THEME = path.join(__dirname, 'theme.txt')

var {
    backgroundColor, foregroundColor, messageColor, defaultTheme
} = require(THEME)
const slateBgColor = "#2B303B"
const slateFgColor = "#8DBB88"
const slateMsgColor = "rgba(0,0,0,0)"
const lightFgColor = "initial"
const darkFgColor = "#f8f8f8"
const lightMsgColor = "initial"
const darkMsgColor = "#288"
const lightBgColor = "initial"
const darkBgColor = "#284472"

var fgColor = darkFgColor
var myMsgColor = darkMsgColor
var bgColor = darkBgColor // #284472 is also pretty cool, as are #248 and #288
var msgTextColor = fgColor

// Options: custom, invCustom, dark, light, original, venom
var setTheme = (theme) => {
    switch(theme) {
        case 'custom': fgColor = foregroundColor;
        bgColor = backgroundColor;
        myMsgColor = messageColor;
        msgTextColor = fgColor;
        break;
        case 'invCustom': fgColor = backgroundColor;
        bgColor = foregroundColor;
        myMsgColor = fgColor;
        msgTextColor = messageColor;
        break;
        case 'dark': fgColor = darkFgColor;
        bgColor = darkBgColor;
        myMsgColor = darkMsgColor;
        msgTextColor = fgColor;
        break;
        case 'light': fgColor = lightFgColor;
        bgColor = lightBgColor;
        myMsgColor = darkMsgColor;
        msgTextColor = fgColor;
        break
        case 'venom': fgColor = slateFgColor;
        bgColor = slateBgColor;
        myMsgColor = slateMsgColor;
        msgTextColor = fgColor;
        break;
        default: fgColor = lightFgColor;
        bgColor = lightBgColor;
        myMsgColor = null;
        msgTextColor = fgColor;
        break;
    }
    if (DEBUG) {
        console.log('Theme: ' + theme)
        console.log('Foreground: ' + fgColor)
        console.log('Background: ' + bgColor)
        console.log('Message: ' + myMsgColor)
        console.log('Default Theme: ' + defaultTheme)
        console.log('Message Text: ' + msgTextColor)
    }
}

setTheme(defaultTheme)

var hideTab = true
let tray = null
var open = false
var win

var launch = () => {
    open = true
    win = new BrowserWindow({
        width: 600, height: 675, icon: __dirname + '/messenger.ico',        
        webPreferences: {
            plugins: true,
            nodeIntegration: false
        },
        frame: false,
    })
    let s = electron.screen.getPrimaryDisplay().workAreaSize
    let _s = win.getSize()
    win.on('closed', () => { win = null; open = false })
    shortcut.register(win, 'Ctrl+Backspace',
     () => { if(win.webContents.canGoBack()) win.webContents.goBack() })
    shortcut.register(win, 'Ctrl+Q', () => { open = false; win.close() })
    shortcut.register(win, 'Ctrl+R', () => { win.reload() })
    shortcut.register(win, 'Ctrl+M', () => { win.minimize() })
    shortcut.register(win, 'Ctrl+Shift+F', 
    () => { win.setFullScreen(!win.isFullScreen()); win.center() })
    shortcut.register(win, 'Ctrl+Y', () => { win.center() })
    shortcut.register(win, 'Ctrl+Shift+I', () => { win.webContents.toggleDevTools() })
    shortcut.register(win, 'Ctrl+Tab', () => {
        if(hideTab) {
            hideTab = false
            win.webContents.insertCSS(`._1enh { display: none; }`)
        }
        else {
            hideTab = true
            win.webContents.insertCSS(`._1enh { display: unset; }`)
        }
    })
    win.loadURL('https://messenger.com/login/')
    win.webContents.on('dom-ready', (e, d) => {
        win.webContents.insertCSS(`
        body { overflow: hidden !important; }
        ._1enh {
           background-color: ${bgColor} 
        }
        ._1t2u { 
            background-color: ${bgColor} 
        }
        /****************/
        /* Messages from You */
        ._nd_ ._hh7 { 
            ` + (myMsgColor? `background-color: ${myMsgColor} !important;`: '') + `
            color: ${fgColor}; 
        }
        /****************/
        h2, ._2v6o, time, ._ih3, ._1tqi, ._1ht6, ._5rpb, ._1htf, ._1ht7 { 
            color: ${fgColor} !important; 
        }
        /****************/
        /* Side Info Pane */
        ._3tkv, ._3szq, ._2jnt, ._1lj0, ._3x6v, ._4rpj, ._364g, ._2jnv {
            color: ${fgColor} !important;
        }
        /****************/
        /* Icon Buttons */
        ._30yy { 
            border-radius: 100px;
            background-color: ${fgColor} !important;
            opacity: 1 !important;
        }
        /* Write Message Button */
        ._2oc8 {
            background-position: center !important;            
            width: 100% !important;
            height: 100% !important;
        }
        ._30yy > div > svg {
            stroke: ${bgColor} !important;            
        }
        /* Top Call Buttons */
        ._fl2 > li > ._30yy {
            padding: 2px !important;            
        }
        /****************/
        ._39bl {
            background: none !important;
            color: ${fgColor} !important;
        }
        ._4rv9 { background: none !important; }
        ._4ld- { 
            border: solid; 
            border-color: ${fgColor}; 
            border-width: 2px; 
            border-radius: 1000px; 
        }
        /****************/
        /* Top region */
        ._673w { -webkit-app-region: drag }
        ._fl2 { -webkit-app-region: no-drag; top: calc(-3px) !important; }
        `)
    })
}

app.on('ready', () => {
    tray = new Tray('./messenger.ico')
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Theme', submenu: [
            {
                label: 'Dark',
                click: (i,w,e) => {
                    setTheme('dark')
                    win.reload()
                }
            },
            {
                label: 'Light',
                click: (i,w,e) => {
                    setTheme('light')
                    win.reload()
                }
            },
            {
                label: 'Original',
                click: (i,w,e) => {
                    setTheme('original')
                    win.reload()
                }
            },            {
                label: 'Venom',
                click: (i,w,e) => {
                    setTheme('venom')
                    win.reload()
                }
            },
            {
                label: 'Custom',
                click: (i,w,e) => {
                    delete require.cache[require.resolve(THEME)]
                    var {
                        backgroundColor, foregroundColor, messageColor, defaultTheme
                    } = require(THEME)
                    setTheme('custom')
                    win.reload()
                }
            },
            {
                label: 'Inv. Custom',
                click: (i,w,e) => {
                    delete require.cache[require.resolve(THEME)]
                    var {
                        backgroundColor, foregroundColor, messageColor, defaultTheme
                    } = require(THEME)
                    setTheme('invCustom')
                    win.reload()
                }
            }
        ]},
        {label: 'Customize', click: (i,w,e) => {
            shell.openItem(THEME)
        }},
        {label: 'Full Reload', click: (i,w,e) => {
            delete require.cache[require.resolve(THEME)]
            var {
                backgroundColor, foregroundColor, messageColor, defaultTheme
            } = require(THEME)
            setTheme(defaultTheme)
            win.destroy()
            launch()
        }},
        {type: 'separator'},
        {role: 'quit'}
      ])
    tray.setToolTip('Custom Messenger')
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
        if (!open) launch()
        else {
            app.focus()
            win.focus()
        }
    })
    /*
    tray.on('right-click', () => {
        app.quit()
        tray.destroy()
    })
    */
    launch()
})