fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'ug-menu'
description 'Menu for UgCore by UgDev'
author 'UgDev'
version '3.5'
url 'https://github.com/ugcore-framework/ug-menu'
ui_page 'html/index.html'

client_script 'client/main.lua'
server_script 'server/version.lua'

files { 
    'html/index.html', 
    'html/css/*.css', 
    'html/js/*.min.js', 
    'html/js/*.js',
    'html/fonts/*.ttf'
}

dependency 'ug-core'