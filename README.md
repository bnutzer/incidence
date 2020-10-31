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
