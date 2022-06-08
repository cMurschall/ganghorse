---
title: Server Side Rendering
date: 2021-01-13
author: Christian Murschall
lang: de
id: 1da0f785

excerpt: Ein neues Feature hat Einzug gehalten, über dass ich schreiben möchte. Server Side  Rendering (kurz SSR). Was ist das und wozu ist das gut? 
imageUrl: blogAssets/images/roselyn-tirado.jpg
---
Ein neues Feature hat Einzug gehalten, über dass ich schreiben möchte: Server Side  Rendering (kurz SSR). Was ist das und wozu ist das gut? 

- In den frühen Tagen des Internets hatte Onkel Tim Berners-Lee sich das so vorgestellt: Jemand kopiert eine html Datei auf einen Server und wenn jemand mit seinem Browser diese Seite anfordert, sendet der Server diese Datei an den Empfänger. Diesen Weg nennt man Static Web Page.

- Irgendwann ist jemand auf die Idee gekommen, dass man ja gar keine richtige Datei braucht. Man kann auch ein Computerprogram schreiben, dass diese 'Datei' bei Aufruf faked. Den Inhalt z.B. aus einer Datenbank ausliest, daraus eine html Datei erstellt und diese dann an den Empfänger sendet. Das ist der Haupteinsatz von Sprachen wie php und populäre programme, die so etwas können heißen WordPress Joomla! oder TYPO3. Das ist Server Side  Rendering.

- Durch schnelle Laufzeitumgebung von JavaScript in modernen Browsern gibt es seit ein paar Jahren einen dritten Weg: Client Side Rendering. In diesem Fall sendet der Webserver eine fast leere Seite und eine Javascriptdatei an den Empfänger. Wenn das Javascript ausgeführt wird, injiziert das javascript programm den Html code in die leere Seite. Gang.horse geht genau diesen Weg.

Wer jetzt einmal einen Rechtsklick macht und "Seitenquelltext anzeigen" auswählt, sieht vom Prinzip so etwas:
```html
<!DOCTYPE html>
<html>
   <head>
      <link href=/css/vendor.css rel=stylesheet>
      <link href=/css/ap.css rel=stylesheet>
   </head>
   <body>
      <div id=q-app></div>
      <script src=/js/vendor.js></script>
      <script src=/js/app.js></script>
   </body>
</html>
```
Ganz so sieht es nicht aus, weil ich, um Daten zu sparen, alle unnötigen Leerzeichen und Zeilenumbrüche entferne. Aber man kann sehen, dass die Seite leer ist, und nur .css und .js (das Javascript) Dateien verlinkt sind. Der Browser läd diese Dateien, führt den Code aus und voilà -  wir sehen die Webseite in unserem Browser. Warum dieser Ansatz jetzt so toll ist und was er für Vorteile hat will ich hier nicht erklären. 

Client Side  Rendering hat allerdings einen riesen Nachteil: Die Internetriesen wie Facebook, Twitter, Xing und Co kommen damit nicht zurecht. Wenn jemand auf diesen Plattformen einen Link teilt, gehen die hin, laden die Seite und unterschen den Inhalt nach bestimmten Metadaten, um eine Vorschau für die anderen Nutzer zu generieren. Was sie nicht tun: das Javascript ausführen. Über die Gründe kann ich nur spekulieren, ich denke, dass sie die Rechenkosten sparen wollen. Technisch ginge es, der Googlebot macht es schon seit einer geraumen Weile.

Die Betreiber von Client Side Rendering Seiten wie ich stehen nun vor diesem Problem. Gang.horse hat von Anfang an folgendes gemacht: Die Plattformen weisen sich in ihren Anfragen aus. Es ist möglich zu detektieren, ob eine Anfrage von Facebook, Twitter, etc. kommt. Diese Art Anfragen wurden zu einen separaten Programm umgeleitet, dass die angefragte Seite direkt von gang.horse läd, dann in einen speziellen Browser (chrome puppeteer) das Javascript ausgeführt, und den dort generierten HTML code zurück an z.B. Facebook sendet. Das funktioniert, ist aber leider recht langsam. Deshalb wurden auf diese Weise erstellte Seiten zwischengespeichert. Blöd ist, wenn eine Pferdeanzeige bearbeitet wird, dann musste die zwischengespeicherte Seite verworfen und neu geladen werden.

Seit heute ist damit endgültig Schluß (tatsächlich schon seit ein paar Wochen). Chrome Puppeteer ist raus, stattdessen läuft der original Javascript-Code in einem eigenen Program, dass viel schneller das HTML erstellen kann als die alte Lösung. Die Anfragen müssen noch immer umgeleitet werden, aber das Zwischenspeichern fällt weg, es ist jetzt schnell genug. Meine Tests in den letzten Wochen haben ergeben, dass diese 'hybrid' Lösung gut funktioniert.

Twitter ist sehr vorbildlich und stellt einen [Validator](https://cards-dev.twitter.com/validator) zur Verfügung, in dem das Teilen eines Links simuliert werden kann. Wer will, kann gerne eine Probe aufs Exempel machen.