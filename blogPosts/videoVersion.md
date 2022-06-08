---
title: Videos und gespeicherte Suchen
date: 2020-09-04
author: Christian Murschall
lang: de
id: 87b0ef0e
excerpt: Nachdem ich die erste Version online gegangen ist, habe ich in verschiedenen Islandpferdeforen einen Link gepostet. Die Reaktionen waren auch sehr gut. Einige hatten Anmerkungen mit Verbesserungsvorschlägen, die ich auch gleich angefangen habe einzubauen.
imageUrl: blogAssets/images/tools-864983_640.jpg
---

Nachdem ich die erste Version online gegangen ist, habe ich in verschiedenen Islandpferdeforen einen Link gepostet. Die Reaktionen waren auch sehr gut. Einige hatten Anmerkungen mit Verbesserungsvorschlägen, die ich auch gleich angefangen habe einzubauen. 
Zwei Neuerungen stehen ab heute für die Käufer von Islandpferden zur Verfügung:
- Suchen speichern. Wer einen Account hat und eingeloggt ist kann die momentanen Sucheinstellungen speichern. Das funktioniert indem unten in der Suche "Suche speichern" aktiviert wird. Die gespeicherten Suchen können in der Box ausgewählt werden.
- Videos. Das war einer der Verbesserungsvorschläge. Hier lohnt es sich, etwas auszuholen. Das Problem von Videos ist, dass man einen recht kräftigen Server braucht, wenn man Videos in guter Qualität streamen will. Einen solchen Server habe ich nicht. Bilder gehen ganz gut, aber Videos sind keine gute Idee. Wer sehr gut Videos steamen kann ist YouTube. Diese Videos lassen sich auch sehr leicht einbetten, allerdings handelt sich der Seitenbesucher sofort ein YouTube Cookie ein, was ich nicht will.

  Gang.horse hat jetzt zwei Optionen Videos zur Verfügung zu stellen:
    - Aus der Amazoncloud steamen.
    - `www.youtube-nocookie.com` nutzen.
      
Die Amazoncloud bietet den Vorteil von schneller Bereitstellung bei vergleichsweise niedrigen Kosten. Hier wird die Videodatei in die Cloud hochgeladen und für das Web konvertiert. (Wer es genau wissen will in MPEG-Dash, das http streaming mit adaptiven Bitraten ermöglicht). Die Originaldatei wird nach der Konvertierung gelöscht, die konvertierten Datei wird entweder im Editor gelöscht oder wenn die Pferdeanzeige gelöscht wird.

Da aber manche Verkäufer die Datei nicht vorliegen haben oder das Video eh schon auf YouTube hochgeladen haben biete ich auch das Einbetten von YouTubelinks an. YouTube bietet datenschutzfreundliches einbetten von Videos unter der Domain `www.youtube-nocookie.com` an. Verkäufer wissen aber meist nicht von dieser Möglichkeit und kopieren einfach den Link des Videos. Meine Lösung ist die watch-id aus der Adresse herauszuextrahieren, eine `www.youtube-nocookie.com` Adresse daraus zu generieren und vor dem Einbetten den Nutzer um Erlaubniss zu bitten. 

Das Vorschaubild wird vom eigenen Server bereitgestellt, der das Bild seinerseits von YouTube abruft, aber die TrackingCookies rausfiltert, so dass ich glaube ich, für den Datenschutz das getan hab, was ich tun kann. 

Weitere Änderungen betreffen das Layout für kleine Handys, in der Detailansicht gibt es bei den Bildern einen Vollbildmodus, und ein paar Verbesserungen beim Login.