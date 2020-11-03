# incidence
COVID-19 Inzidenz-Widget für iOS innerhalb Deutschlands 🇩🇪 (Kreis/Stadt + Bundesland + Deutschland + Trend)
Source Code: <b>incidence.js</b>

<img src=incidence.jpg>

Skript muss in der App Scriptable importiert werden und kann dann als Widget genutzt werden. 

Das Widget kann parametriert werden. Durch Übergabe des ersten Parameters kann umgeschaltet werden zwischen Kurvenanzeige und Statistik-Anzeige:

Format der Parameterübergabe
ShowGraph[,LATITUDE,LONGITUDE]

Beispiele Parameterübergabe:

Grafik-Anzeige aktuelle Position: 1
Grafik-Anzeige fixer Koordinaten: 1,51.1244,6.7353
Statistik-Anzeige aktuelle Position: 0
Statistik-Anzeige fixer Koordinaten: 0,51.1244,6.7353


# overviewCases
COVID-19 Fallzahlen-Widget für iOS innerhalb Deutschlands
Source

Source Code: <b>overviewCases.js</b>

<img src=overviewCases.jpg>

Skript zeigt die Neuinfizierten, Geheilten und Todesfälle (sowie R-Faktor für Gesamtdeutschland) an.
Es kann per Parameter eingestellt werden, ob die Zahlen für Landkreis, Bundesland oder Gesamtdeutschland angezeigt werden sollen. Außerdem kann ein eigener Landkreis/Bundesland-Name über Parameter vergeben werden.

Parameterübergabe Beispiel:
Gebiet, LAT, LON, Name

Erklärung:
Gebiet = 0: Landkreis
Gebiet = 1: Bundesland
Gebiet = 2: Deutschland
LAT,LON = Koordinaten
Name = Eigene Bezeichnung des Landkreises/Bundeslands (optional)

Beispiele:

lokaler Landkreis: ""
lokales Bundesland: "1"
Fremdes Bundesland Bayern: "1,48.96,12.38"
Fremder Landkreis Regensburg mit eigenem Namen: "1,48.96,12.38,LK Regensburg"
Deutschland: "2"

Als Widget Medium-Size werden zusätzliche Informationen angezeigt. Auf der linken Seite: 
-  Inzidenz mit Trend Pfeil 
    Der Trendpfeil bestimmt sich durch den geschätzten (!) R-Faktor. Dieser wird direkt darunter angezeigt. Ist der R-Faktor zwischen 0,95 und 1,05 bleibt die Inzidenz in etwa konstant (→), ist der R-Faktor zwischen 1,05 und 1,1 steigt die Inzidenz leicht (↗), über 1,1 steigt sie stark (↑). Ist der R-Fakor zwischen 0,9 und 0,95 sinkt die Inzidenz leicht (↘), unter 0,9 sinkt sie stark (↓). 
- Geschätzter R-Faktor. 
    Der R-Faktor soll die Zahl derer angeben, die von einem Infizierten angesteckt werden. D.h. ein R-Faktor von 2 bedeutet ein Infizierter steckt im Durchschnitt 2 weitere Menschen an. Der R-Faktor wird unter der Annahme geschätzt, dass zwischen Ansteckung und selbst ansteckbar im Durchschnitt 3,5 Tage vergehen. Außerdem werden die durchschnittlichen Neuinfizierte über 7 Tage gemittelt (um statistische Effekte am Wochenende zu eliminieren). Beispiel: Vor 7 Tagen gab es im 7-Tage Schnitt 4 Neuinfektionen. Heute gibt es im 7-Tage-Schnitt 16 Neuinfektionen. Unter der Annahme der 3,5 Tage und einem R-Faktor von 2 haben die 4 Neuinfektionen nach 3,5 Tagen also 8 Personen angesteckt, welche nach weiteren 3,5 Tagen 16 Personen angesteckt haben. Der R-Faktor berechnet sich dann also aus R=Wurzel(Neuinfektionen_heute/Neuinfektionen_vor7Tagen) = Wurzel(16/4) = 2
    Dies ist nur eine grobe Schätzung, um die ungefähre Dynamik der Pandemie anzugeben und den Trend zu bestimmen!
- Inzidenz-Graph-Verlauf der letzten 4 Wochen

Auf der rechten Seite: 
- Aktive Fälle im Landkreis/Bundesland/Deutschland
- Neuinfizierte am heutigen Tag im Landkreis/Bundesland/Deutschland (in Klammern die Gesamtzahl der jeweiligen Region)
- Neugenesene am heutigen Tag im Landkreis/Bundesland/Deutschland (in Klammern die Gesamtzahl der jeweiligen Region)
- Neue Todesfälle am heutigen Tag im Landkreis/Bundesland/Deutschland (in Klammern die Gesamtzahl der jeweiligen Region)
- Anzahl der COVID-19 Patienten, die im Krankenhaus behandelt werden im Landkreis/Bundesland/Deutschland (in Klammern der relative Anteil zu den aktuell Infizierten)
- Anzahl der COVID-19 Patienten, die im Krankenhaus beatmet werden im Landkreis/Bundesland/Deutschland (in Klammern der relative Anteil zu den aktuell Infizierten)
- Anzahl freier Intensivbetten im Landkreis/Bundesland/Deutschland (relativer Anteil der Gesamtintensivbetten)

<img src=overviewCasesMedium.jpg>