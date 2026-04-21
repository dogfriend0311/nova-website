import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "../shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "../components/UI";

// ─── TRIVIA ───────────────────────────────────────────────────────────────────────
// ─── TRIVIA ───────────────────────────────────────────────────────────────────────
const TRIVIA_Q={
  mlb:{
    easy:[
      {q:"Who won the 2023 AL MVP award?",a:"Shohei Ohtani",w:["Aaron Judge","Freddie Freeman","Shohei Ohtani","Yordan Alvarez"]},
      {q:"Which team won the 2023 World Series?",a:"Texas Rangers",w:["Arizona Diamondbacks","Texas Rangers","Houston Astros","Atlanta Braves"]},
      {q:"Who hit 62 home runs in 2022 to break the AL record?",a:"Aaron Judge",w:["Aaron Judge","Pete Alonso","Kyle Schwarber","Yordan Alvarez"]},
      {q:"Who won the 2022 NL Cy Young Award?",a:"Sandy Alcantara",w:["Corbin Burnes","Sandy Alcantara","Max Scherzer","Spencer Strider"]},
      {q:"Which team did Shohei Ohtani sign with before the 2024 season?",a:"Los Angeles Dodgers",w:["San Francisco Giants","Los Angeles Dodgers","New York Yankees","Toronto Blue Jays"]},
      {q:"Who won the 2021 World Series?",a:"Atlanta Braves",w:["Houston Astros","Atlanta Braves","Tampa Bay Rays","Los Angeles Dodgers"]},
      {q:"Who won the 2019 AL MVP?",a:"Mike Trout",w:["Alex Bregman","Mike Trout","George Springer","Jose Abreu"]},
      {q:"What team did Freddie Freeman win the 2020 NL MVP with?",a:"Atlanta Braves",w:["Los Angeles Dodgers","Atlanta Braves","Washington Nationals","New York Mets"]},
      {q:"Who won the 2022 World Series?",a:"Houston Astros",w:["Philadelphia Phillies","Houston Astros","Atlanta Braves","New York Yankees"]},
      {q:"Which pitcher won the 2023 AL Cy Young?",a:"Gerrit Cole",w:["Dylan Cease","Gerrit Cole","Kevin Gausman","Luis Castillo"]},
      {q:"Who holds the record for most career stolen bases?",a:"Rickey Henderson (1,406)",w:["Tim Raines (808)","Vince Coleman (752)","Lou Brock (938)","Rickey Henderson (1,406)"]},
      {q:"Who won the 2020 World Series?",a:"Los Angeles Dodgers",w:["Tampa Bay Rays","Los Angeles Dodgers","Houston Astros","Atlanta Braves"]},
      {q:"Which player won the NL MVP in both 2021 and 2023?",a:"Bryce Harper / Freddie Freeman",w:["Bryce Harper / Freddie Freeman","Juan Soto","Paul Goldschmidt","Mookie Betts"]},
      {q:"Who won the 2023 NL MVP?",a:"Ronald Acuña Jr.",w:["Mookie Betts","Freddie Freeman","Ronald Acuña Jr.","Matt Olson"]},
      {q:"Shohei Ohtani won the 2021 AL MVP unanimously. How many first-place votes did he receive?",a:"30 (unanimous)",w:["28","30 (unanimous)","25","All but 2"]},
      {q:"Who won the 2018 NL Cy Young Award?",a:"Jacob deGrom",w:["Max Scherzer","Patrick Corbin","Aaron Nola","Jacob deGrom"]},
      {q:"Which team won back-to-back World Series in 2017 and 2018?",a:"No team — Houston won 2017, Boston won 2018",w:["Houston Astros","Los Angeles Dodgers","No team — Houston won 2017, Boston won 2018","Boston Red Sox"]},
      {q:"Who led the NL in batting average in 2023?",a:"Luis Arraez (.354)",w:["Freddie Freeman","Luis Arraez (.354)","Mookie Betts","Matt Olson"]},
      {q:"Which team did Pete Alonso win the 2019 Home Run Derby with?",a:"New York Mets",w:["New York Yankees","New York Mets","Los Angeles Dodgers","Chicago Cubs"]},
      {q:"Who won the 2019 World Series MVP?",a:"Stephen Strasburg",w:["Anthony Rendon","Stephen Strasburg","Howie Kendrick","Max Scherzer"]},
    ],
    medium:[
      {q:"Jacob deGrom won back-to-back NL Cy Young Awards. Which years?",a:"2018 and 2019",w:["2017 and 2018","2018 and 2019","2019 and 2020","2020 and 2021"]},
      {q:"Who was the only player to win MVP in both leagues?",a:"Frank Robinson",w:["Barry Bonds","Frank Robinson","Roger Clemens","Hank Aaron"]},
      {q:"Which pitcher had a 1.70 ERA over 2018–2019 combined, the lowest in modern history for a starter?",a:"Jacob deGrom",w:["Max Scherzer","Clayton Kershaw","Jacob deGrom","Justin Verlander"]},
      {q:"Who won the 2011 AL MVP with 45 HRs, 111 RBI while playing for the Tigers?",a:"Justin Verlander",w:["Jose Bautista","Adrian Beltre","Justin Verlander","Curtis Granderson"]},
      {q:"Barry Bonds set the single-season OPS record in 2004. What was it?",a:"1.421",w:["1.298","1.350","1.421","1.381"]},
      {q:"Which team won three consecutive World Series titles from 2000–2002?",a:"No team — Yankees won 2000, D-backs 2001, Angels 2002",w:["New York Yankees","No team — Yankees won 2000, D-backs 2001, Angels 2002","Atlanta Braves","Boston Red Sox"]},
      {q:"Who hit .406 in 1941, the last player to hit .400 in a season?",a:"Ted Williams",w:["Joe DiMaggio","Ted Williams","Stan Musial","Mickey Mantle"]},
      {q:"What was Mike Trout's WAR in 2012, considered one of the highest rookie seasons ever?",a:"10.9",w:["8.7","9.4","10.9","7.6"]},
      {q:"Who won the 2016 NL MVP with the Cubs?",a:"Kris Bryant",w:["Anthony Rizzo","Jon Lester","Kris Bryant","Jake Arrieta"]},
      {q:"Which closer set the all-time saves record with 652?",a:"Mariano Rivera",w:["Trevor Hoffman","Billy Wagner","Mariano Rivera","Lee Smith"]},
      {q:"Who threw a perfect game on May 29, 2010 only to have it controversially called off on the final out?",a:"Armando Galarraga",w:["Dallas Braden","Roy Halladay","Armando Galarraga","Ubaldo Jimenez"]},
      {q:"Which hitter led the AL in OPS+ for 7 consecutive seasons from 2012–2018?",a:"Mike Trout",w:["Miguel Cabrera","Mike Trout","Jose Altuve","Mookie Betts"]},
      {q:"Who was the 2013 AL Cy Young winner with a 24-5 record?",a:"Max Scherzer",w:["Felix Hernandez","Max Scherzer","Hisashi Iwakuma","Justin Verlander"]},
      {q:"How many consecutive Gold Glove Awards did Yadier Molina win at catcher?",a:"9",w:["6","8","9","13"]},
      {q:"Which team did Clayton Kershaw win his 2014 NL MVP AND Cy Young with?",a:"Los Angeles Dodgers",w:["Atlanta Braves","San Francisco Giants","Los Angeles Dodgers","Cincinnati Reds"]},
      {q:"Who led MLB in WAR in 2019 with a mark of 8.3?",a:"Cody Bellinger",w:["Christian Yelich","Mike Trout","Cody Bellinger","Freddie Freeman"]},
      {q:"In 2001, who hit .350 with 73 HRs and 137 RBI, winning the NL MVP?",a:"Barry Bonds",w:["Barry Bonds","Sammy Sosa","Luis Gonzalez","Jeff Bagwell"]},
      {q:"What is the MLB record for strikeouts in a single season by a pitcher?",a:"383 (Nolan Ryan, 1973)",w:["341 (Randy Johnson)","368 (Sandy Koufax)","382 (Steve Carlton)","383 (Nolan Ryan, 1973)"]},
      {q:"Which team lost the 2017 World Series but was later revealed to have been sign-stealing?",a:"Houston Astros (won it, controversy arose after)",w:["Houston Astros (won it, controversy arose after)","Los Angeles Dodgers","New York Yankees","Boston Red Sox"]},
      {q:"Who won the 2014 AL MVP with the Tigers, the last first baseman to win it?",a:"Miguel Cabrera",w:["Mike Trout","Miguel Cabrera","Nelson Cruz","Victor Martinez"]},
    ],
    hard:[
      {q:"Ichiro set the single-season hits record in 2004 with how many hits?",a:"262",w:["255","258","262","271"]},
      {q:"Who had the highest single-season fWAR since integration, recording 12.6 in 2012?",a:"Mike Trout",w:["Barry Bonds (2002)","Mike Trout","Willie Mays (1962)","Babe Ruth (1923)"]},
      {q:"Which pitcher won the NL Cy Young in 2020 despite only pitching 73 innings?",a:"Trevor Bauer",w:["Yu Darvish","Jacob deGrom","Trevor Bauer","Dinelson Lamet"]},
      {q:"What team did the 2019 Astros' sign-stealing scheme most directly affect in the playoffs?",a:"All opponents, most notably the Yankees and Dodgers",w:["Boston Red Sox","All opponents, most notably the Yankees and Dodgers","Tampa Bay Rays","New York Yankees"]},
      {q:"Who led MLB in bWAR in BOTH 2013 and 2014?",a:"Mike Trout",w:["Miguel Cabrera","Clayton Kershaw","Mike Trout","Andrew McCutchen"]},
      {q:"Which team's 2018 sign-stealing investigation also resulted in a manager firing?",a:"Boston Red Sox (Alex Cora fired)",w:["Houston Astros","Boston Red Sox (Alex Cora fired)","New York Mets","Los Angeles Dodgers"]},
      {q:"What was Felix Hernandez's ERA in 2010 when he won the AL Cy Young with only 13 wins?",a:"2.27",w:["2.43","2.61","2.27","1.98"]},
      {q:"Who had the highest single-season OBP since 1950 with .609 in 2004?",a:"Barry Bonds",w:["Ted Williams","Babe Ruth","Barry Bonds","Mickey Mantle"]},
      {q:"Which pitcher holds the record for most no-hitters thrown in a career?",a:"Nolan Ryan (7)",w:["Sandy Koufax (4)","Bob Feller (3)","Nolan Ryan (7)","Randy Johnson (2)"]},
      {q:"In what year did the Houston Astros go from worst to first, winning 86 games after losing 111?",a:"2015",w:["2013","2014","2015","2016"]},
      {q:"What was Zack Greinke's ERA in 2009 when he won the AL Cy Young?",a:"2.16",w:["2.33","1.99","2.16","2.48"]},
      {q:"Who hit .372 in 1994 — the year the season was cut short by a strike — to potentially threaten .400?",a:"Tony Gwynn",w:["Frank Thomas","Tony Gwynn","Jeff Bagwell","Matt Williams"]},
      {q:"Which player was intentionally walked 120 times in a single season?",a:"Barry Bonds (2004)",w:["Babe Ruth (1923)","Ted Williams (1957)","Barry Bonds (2004)","Mickey Mantle (1961)"]},
      {q:"How many consecutive scoreless innings did Orel Hershiser throw in 1988, setting the MLB record?",a:"59",w:["52","55","59","63"]},
      {q:"Who won the 2012 AL MVP, the last player other than Trout or Ohtani to win it until 2024?",a:"Miguel Cabrera (Triple Crown season)",w:["Josh Hamilton","Miguel Cabrera (Triple Crown season)","Mike Trout","Robinson Cano"]},
    ],
  },
  nfl:{
    easy:[
      {q:"Who won the 2023 NFL MVP award?",a:"Lamar Jackson",w:["Patrick Mahomes","Josh Allen","Lamar Jackson","CJ Stroud"]},
      {q:"Which team won Super Bowl LVIII (58) in 2024?",a:"Kansas City Chiefs",w:["San Francisco 49ers","Kansas City Chiefs","Baltimore Ravens","Detroit Lions"]},
      {q:"Who won the Super Bowl MVP in Super Bowl LVIII?",a:"Patrick Mahomes",w:["Travis Kelce","Patrick Mahomes","Mecole Hardman","Chris Jones"]},
      {q:"How many MVP awards has Lamar Jackson won as of 2024?",a:"2 (2019 and 2023)",w:["1","2 (2019 and 2023)","3","He's never won MVP"]},
      {q:"Who won the 2022 NFL MVP?",a:"Patrick Mahomes",w:["Josh Allen","Justin Jefferson","Patrick Mahomes","Jalen Hurts"]},
      {q:"Which team won Super Bowl LVII (57)?",a:"Kansas City Chiefs",w:["Philadelphia Eagles","Kansas City Chiefs","San Francisco 49ers","Cincinnati Bengals"]},
      {q:"Who won the 2021 NFL MVP?",a:"Cooper Kupp (Offensive Player) / Aaron Rodgers (MVP)",w:["Josh Allen","Tom Brady","Cooper Kupp (Offensive Player) / Aaron Rodgers (MVP)","Dak Prescott"]},
      {q:"Who won back-to-back NFL MVP awards in 2020 and 2021?",a:"Aaron Rodgers",w:["Patrick Mahomes","Tom Brady","Aaron Rodgers","Josh Allen"]},
      {q:"Which team won Super Bowl LV (55) defeating the Chiefs 31-9?",a:"Tampa Bay Buccaneers",w:["Kansas City Chiefs","Tampa Bay Buccaneers","Green Bay Packers","Buffalo Bills"]},
      {q:"Who was the Super Bowl LV MVP?",a:"Tom Brady",w:["Rob Gronkowski","Tom Brady","Chris Godwin","Antonio Brown"]},
      {q:"How many total Super Bowls has Patrick Mahomes won as of 2024?",a:"3",w:["2","3","4","1"]},
      {q:"Who won the 2018 NFL MVP?",a:"Patrick Mahomes",w:["Drew Brees","Patrick Mahomes","Todd Gurley","Saquon Barkley"]},
      {q:"Which team did Tom Brady win his 7th Super Bowl with?",a:"Tampa Bay Buccaneers",w:["New England Patriots","Tampa Bay Buccaneers","Los Angeles Rams","Kansas City Chiefs"]},
      {q:"Who won the 2019 NFL MVP?",a:"Lamar Jackson",w:["Patrick Mahomes","Lamar Jackson","Russell Wilson","Deshaun Watson"]},
      {q:"Which running back won the 2018 NFL Offensive Rookie of the Year?",a:"Saquon Barkley",w:["Nick Chubb","Saquon Barkley","Phillip Lindsay","Sony Michel"]},
      {q:"Who led the NFL in receiving yards in 2022?",a:"Justin Jefferson",w:["Davante Adams","Tyreek Hill","Justin Jefferson","Stefon Diggs"]},
      {q:"Which team won Super Bowl LVI (56)?",a:"Los Angeles Rams",w:["Cincinnati Bengals","Los Angeles Rams","San Francisco 49ers","Las Vegas Raiders"]},
      {q:"Who was the Super Bowl LVI MVP?",a:"Cooper Kupp",w:["Matthew Stafford","Aaron Donald","Cooper Kupp","Odell Beckham Jr."]},
      {q:"How many passing TDs did Patrick Mahomes throw in his MVP 2018 season?",a:"50",w:["43","46","50","54"]},
      {q:"Which defensive player won the 2023 NFL Defensive Player of the Year?",a:"Myles Garrett",w:["Micah Parsons","Myles Garrett","Maxx Crosby","Fred Warner"]},
    ],
    medium:[
      {q:"Lamar Jackson's 2019 MVP season — how many passing TDs did he throw?",a:"36",w:["31","34","36","41"]},
      {q:"Who won the NFL MVP in 2017 with 4,577 yards and 34 TDs for the Eagles?",a:"Carson Wentz (but lost it to Tom Brady due to injury)",w:["Carson Wentz (but lost it to Tom Brady due to injury)","Nick Foles","Tom Brady","Drew Brees"]},
      {q:"Which QB set the NFL single-season completion percentage record of 74.3% in 2018?",a:"Drew Brees",w:["Aaron Rodgers","Patrick Mahomes","Drew Brees","Nick Foles"]},
      {q:"Who won the AP NFL MVP in 2012, his third in four years?",a:"Adrian Peterson",w:["Peyton Manning","Tom Brady","Adrian Peterson","Aaron Rodgers"]},
      {q:"What was Peyton Manning's single-season TD record set in 2013?",a:"55",w:["50","52","55","57"]},
      {q:"Who won the 2016 NFL MVP despite the Falcons going 11-5?",a:"Matt Ryan",w:["Dak Prescott","Matt Ryan","Ezekiel Elliott","Drew Brees"]},
      {q:"Which receiver set the NFL record for receiving yards in a season in 2012?",a:"Calvin Johnson (1,964 yards)",w:["Jerry Rice (1,848)","Julio Jones (1,964)","Calvin Johnson (1,964 yards)","Randy Moss (1,782)"]},
      {q:"Who rushed for 2,097 yards in 2012, second-most in NFL history?",a:"Adrian Peterson",w:["Jamaal Charles","LeSean McCoy","Adrian Peterson","Marshawn Lynch"]},
      {q:"Which team's defense allowed the fewest points in 2023, earning the #1 seed?",a:"San Francisco 49ers",w:["Baltimore Ravens","Dallas Cowboys","San Francisco 49ers","Cleveland Browns"]},
      {q:"Who won the 2015 NFL MVP, his second, leading the Panthers to a 15-1 record?",a:"Cam Newton",w:["Tom Brady","Cam Newton","Russell Wilson","Aaron Rodgers"]},
      {q:"What yards-per-carry did Derrick Henry average in his 2,000-yard 2020 season?",a:"5.4",w:["4.8","5.1","5.4","5.9"]},
      {q:"Which QB was the only unanimous NFL MVP in history (2024 ballot)?",a:"No one — there has been no unanimous MVP",w:["Lamar Jackson","Patrick Mahomes","No one — there has been no unanimous MVP","Aaron Rodgers"]},
      {q:"Who holds the record for most rushing TDs in a season with 28 in 1945?",a:"Steve Van Buren",w:["LaDainian Tomlinson (28 in 2006)","Emmitt Smith","Steve Van Buren","Jim Brown"]},
      {q:"Which team did Peyton Manning win his 5th MVP with in 2013?",a:"Denver Broncos",w:["Indianapolis Colts","Denver Broncos","Tennessee Titans","New Orleans Saints"]},
      {q:"Who was the last running back to win the NFL MVP before LaDainian Tomlinson in 2006?",a:"Marshall Faulk (2000)",w:["Emmitt Smith (1995)","Marshall Faulk (2000)","Barry Sanders (1997)","Jamal Lewis (2003)"]},
      {q:"How many interceptions did Lamar Jackson throw in his unanimous-style 2019 MVP season?",a:"6",w:["3","6","9","12"]},
      {q:"Which team did Kurt Warner win his second NFL MVP with in 2001?",a:"St. Louis Rams",w:["Arizona Cardinals","St. Louis Rams","New York Giants","Green Bay Packers"]},
      {q:"Justin Jefferson set the record for receiving yards in a player's first two NFL seasons. How many?",a:"3,016",w:["2,841","2,974","3,016","3,125"]},
      {q:"Who won the Super Bowl LI MVP after the greatest comeback in Super Bowl history?",a:"Tom Brady",w:["James White","Julian Edelman","Tom Brady","Malcolm Butler"]},
      {q:"How many straight 4,000-yard passing seasons did Drew Brees have from 2006–2018?",a:"13",w:["9","11","13","14"]},
    ],
    hard:[
      {q:"Lamar Jackson's 2019 MVP season passer rating was the highest single-season mark ever at the time. What was it?",a:"113.3",w:["109.7","111.4","113.3","116.1"]},
      {q:"Who was the only player to win the NFL MVP, Super Bowl MVP, and be cut the next season?",a:"Joe Theismann (not exactly) — trick Q. Answer: no such player exists",w:["Jim Plunkett","Joe Theismann (not exactly) — trick Q. Answer: no such player exists","Doug Williams","Phil Simms"]},
      {q:"Patrick Mahomes' 2018 MVP season: what was his adjusted net yards per attempt?",a:"9.6",w:["8.7","9.1","9.6","10.2"]},
      {q:"Which QB has the highest career passer rating in NFL history (minimum 1,500 attempts)?",a:"Patrick Mahomes (106.3 entering 2024)",w:["Aaron Rodgers (103.1)","Tom Brady (97.6)","Patrick Mahomes (106.3 entering 2024)","Tony Romo (97.6)"]},
      {q:"Who led the NFL in EPA (Expected Points Added) per dropback in 2023?",a:"Dak Prescott",w:["Josh Allen","Tua Tagovailoa","Dak Prescott","Brock Purdy"]},
      {q:"What was Peyton Manning's TD:INT ratio in his 55-TD 2013 season?",a:"55:10",w:["55:7","55:10","55:12","55:8"]},
      {q:"Which team went 14-3 in the 2023 regular season but lost in the NFC Championship?",a:"San Francisco 49ers",w:["Detroit Lions","Philadelphia Eagles","San Francisco 49ers","Dallas Cowboys"]},
      {q:"Who holds the NFL record for most receiving yards in a single game?",a:"Flipper Anderson (336 yards, 1989)",w:["Jerry Rice (289)","Calvin Johnson (329)","Flipper Anderson (336 yards, 1989)","Colt Anderson (303)"]},
      {q:"Aaron Rodgers' 2011 season had the highest single-season passer rating at the time. What was it?",a:"122.5",w:["118.6","120.3","122.5","124.8"]},
      {q:"Which team holds the record for most points scored in a single Super Bowl?",a:"San Francisco 49ers (55 points, Super Bowl XXIX)",w:["Chicago Bears (46, Super Bowl XX)","San Francisco 49ers (55 points, Super Bowl XXIX)","Dallas Cowboys (52, Super Bowl XXVII)","New England Patriots (48, Super Bowl XXXIX)"]},
      {q:"How many NFL MVP awards has Aaron Rodgers won?",a:"4 (2011, 2014, 2020, 2021)",w:["3","4 (2011, 2014, 2020, 2021)","2","5"]},
      {q:"Who set the record for most tackles for loss in a single season with 23 in 2019?",a:"Myles Garrett",w:["Aaron Donald","Myles Garrett","Chase Young","Joey Bosa"]},
      {q:"Which QB threw 40 TDs and only 4 INTs in 2018, with a historically low interception rate?",a:"Drew Brees",w:["Patrick Mahomes","Drew Brees","Aaron Rodgers","Matt Ryan"]},
      {q:"What record did Justin Jefferson break in 2022 to become the fastest to 5,000 career receiving yards?",a:"Odell Beckham Jr.'s record",w:["Randy Moss's record","Odell Beckham Jr.'s record","Jerry Rice's record","Marvin Harrison's record"]},
      {q:"Who was the defensive MVP of Super Bowl XLVIII, a 43-8 Seattle blowout of Denver?",a:"Malcolm Smith",w:["Earl Thomas","Richard Sherman","Malcolm Smith","Bobby Wagner"]},
    ],
  },
  nba:{
    easy:[
      {q:"Who won the 2023 NBA MVP?",a:"Joel Embiid",w:["Nikola Jokic","Joel Embiid","Jayson Tatum","Luka Doncic"]},
      {q:"How many consecutive NBA MVPs did Nikola Jokic win before Embiid in 2023?",a:"2 (2021 and 2022)",w:["1","2 (2021 and 2022)","3","He won 3 straight"]},
      {q:"Which team won the 2023 NBA Championship?",a:"Denver Nuggets",w:["Miami Heat","Denver Nuggets","Boston Celtics","Golden State Warriors"]},
      {q:"Who was the 2023 NBA Finals MVP?",a:"Nikola Jokic",w:["Jamal Murray","Nikola Jokic","Jaylen Brown","Jimmy Butler"]},
      {q:"Which team won the 2022 NBA Championship?",a:"Golden State Warriors",w:["Boston Celtics","Golden State Warriors","Miami Heat","Memphis Grizzlies"]},
      {q:"Who won the 2022 NBA Finals MVP?",a:"Stephen Curry",w:["Klay Thompson","Draymond Green","Stephen Curry","Andrew Wiggins"]},
      {q:"LeBron James passed Kareem Abdul-Jabbar as the all-time scoring leader in what year?",a:"2023",w:["2021","2022","2023","2024"]},
      {q:"Who won the 2021 NBA MVP?",a:"Nikola Jokic",w:["Giannis Antetokounmpo","Stephen Curry","Nikola Jokic","Luka Doncic"]},
      {q:"Who won the 2021 NBA Championship?",a:"Milwaukee Bucks",w:["Phoenix Suns","Atlanta Hawks","Milwaukee Bucks","Los Angeles Clippers"]},
      {q:"Who was the 2021 NBA Finals MVP?",a:"Giannis Antetokounmpo",w:["Khris Middleton","Jrue Holiday","Giannis Antetokounmpo","Brook Lopez"]},
      {q:"Giannis Antetokounmpo won back-to-back MVPs in which years?",a:"2019 and 2020",w:["2018 and 2019","2019 and 2020","2020 and 2021","2021 and 2022"]},
      {q:"Who won the 2024 NBA MVP?",a:"Nikola Jokic",w:["Luka Doncic","Shai Gilgeous-Alexander","Nikola Jokic","Jayson Tatum"]},
      {q:"Which team did LeBron James win his first NBA championship with?",a:"Miami Heat",w:["Cleveland Cavaliers","Miami Heat","Los Angeles Lakers","Boston Celtics"]},
      {q:"Who won the 2020 NBA MVP?",a:"Giannis Antetokounmpo",w:["LeBron James","James Harden","Giannis Antetokounmpo","Kawhi Leonard"]},
      {q:"Which team won the 2024 NBA Championship?",a:"Boston Celtics",w:["Dallas Mavericks","Boston Celtics","Indiana Pacers","New York Knicks"]},
      {q:"Who was the 2018 NBA Finals MVP playing for Golden State?",a:"Kevin Durant",w:["Stephen Curry","Klay Thompson","Kevin Durant","Draymond Green"]},
      {q:"Stephen Curry set the NBA 3-point record in 2015-16 with how many makes?",a:"402",w:["339","371","402","418"]},
      {q:"Who won the 2019 NBA Finals MVP?",a:"Kawhi Leonard",w:["Kyle Lowry","Pascal Siakam","Kawhi Leonard","Marc Gasol"]},
      {q:"Which team won the 2019 NBA Championship?",a:"Toronto Raptors",w:["Golden State Warriors","Toronto Raptors","Milwaukee Bucks","Portland Trail Blazers"]},
      {q:"Who won the 2016 NBA MVP?",a:"Stephen Curry (unanimous)",w:["LeBron James","Kevin Durant","Stephen Curry (unanimous)","Kawhi Leonard"]},
    ],
    medium:[
      {q:"Nikola Jokic's 2021 MVP season — what was his stat line (PPG/RPG/APG)?",a:"26.4 / 10.8 / 8.3",w:["24.2 / 9.7 / 7.1","26.4 / 10.8 / 8.3","28.1 / 11.2 / 7.9","23.6 / 10.2 / 8.9"]},
      {q:"Which player became the first center to win MVP since Shaquille O'Neal (2000) until Jokic?",a:"Nikola Jokic was the first since Shaq",w:["Dwight Howard","Joel Embiid","Nikola Jokic was the first since Shaq","Karl-Anthony Towns"]},
      {q:"Stephen Curry's unanimous 2016 MVP season: what was his PPG?",a:"30.1",w:["27.8","29.4","30.1","32.3"]},
      {q:"Who holds the NBA record for most points in a playoff series?",a:"Michael Jordan (though Wilt held single-game records)",w:["Michael Jordan (though Wilt held single-game records)","LeBron James","Kobe Bryant","Jerry West"]},
      {q:"Which player averaged 36.3 PPG in the 2007 playoffs, the highest since Michael Jordan?",a:"LeBron James",w:["Dwyane Wade","Kobe Bryant","LeBron James","Dirk Nowitzki"]},
      {q:"Who won the NBA MVP in 2014 with OKC, averaging 32.0 PPG?",a:"Kevin Durant",w:["LeBron James","Kevin Durant","Russell Westbrook","James Harden"]},
      {q:"Russell Westbrook averaged a triple-double for the full season in 2016-17. What was his APG?",a:"10.4",w:["9.1","10.4","11.2","12.0"]},
      {q:"Which player won the MVP in 2018 with the most Win Shares in the league despite playing for the Rockets?",a:"James Harden",w:["LeBron James","James Harden","Steph Curry","Anthony Davis"]},
      {q:"Who led the NBA in scoring in 2023-24 with 34.3 PPG?",a:"Luka Doncic",w:["Shai Gilgeous-Alexander","Jayson Tatum","Luka Doncic","Damian Lillard"]},
      {q:"Which team set the NBA record for wins in a season with 73 in 2015-16?",a:"Golden State Warriors",w:["Chicago Bulls (72-10)","Golden State Warriors","San Antonio Spurs","Cleveland Cavaliers"]},
      {q:"Giannis Antetokounmpo's 2019-20 MVP season: what was his PER?",a:"31.9",w:["28.7","30.4","31.9","33.2"]},
      {q:"Who won the Defensive Player of the Year AND MVP in the same season (2020)?",a:"Giannis Antetokounmpo",w:["Kawhi Leonard","Ben Simmons","Giannis Antetokounmpo","Rudy Gobert"]},
      {q:"Joel Embiid's 2022-23 MVP season had what PPG, highest by an MVP since Jordan?",a:"33.1",w:["30.6","31.8","33.1","34.7"]},
      {q:"Which player averaged 29/8/8 in the 2023 Finals to win MVP despite his team losing?",a:"No player wins Finals MVP on the losing team — Jimmy Butler came close",w:["Jimmy Butler","Nikola Jokic","No player wins Finals MVP on the losing team — Jimmy Butler came close","Jamal Murray"]},
      {q:"Who holds the record for the highest single-season assist average in NBA history?",a:"John Stockton (14.5 APG, 1989-90)",w:["Magic Johnson (13.1)","John Stockton (14.5 APG, 1989-90)","Isiah Thomas (13.9)","Oscar Robertson (11.5)"]},
      {q:"Which team had the best record in the 2023-24 regular season?",a:"Oklahoma City Thunder",w:["Boston Celtics","Oklahoma City Thunder","Milwaukee Bucks","Denver Nuggets"]},
      {q:"How many MVP awards did LeBron James win in his career?",a:"4",w:["3","4","5","6"]},
      {q:"Who was the 2017 NBA MVP leading the Rockets to 55 wins?",a:"James Harden",w:["Chris Paul","Steph Curry","James Harden","Kawhi Leonard"]},
      {q:"Which player won the 2024 NBA Finals MVP for the Celtics?",a:"Jaylen Brown",w:["Jayson Tatum","Al Horford","Jaylen Brown","Jrue Holiday"]},
      {q:"What was Wilt Chamberlain's scoring average in 1961-62, an NBA record?",a:"50.4 PPG",w:["44.8 PPG","48.1 PPG","50.4 PPG","52.2 PPG"]},
    ],
    hard:[
      {q:"Nikola Jokic is the only player in NBA history to be in the top 20 in both career PER and career assist percentage. True or false — and what is his career PER entering 2024?",a:"True — approximately 31.3 career PER",w:["False — PER is around 26.8","True — approximately 31.3 career PER","True — approximately 28.9 career PER","False — PER is around 29.4"]},
      {q:"Which player holds the NBA record for most triple-doubles in a career?",a:"Russell Westbrook (198)",w:["Magic Johnson (138)","Oscar Robertson (181)","Russell Westbrook (198)","LeBron James (107)"]},
      {q:"Stephen Curry set the record for most 3s in a playoff series with how many in 2015?",a:"98 total in 2015 playoffs",w:["78","88","98 total in 2015 playoffs","104"]},
      {q:"What was Michael Jordan's career playoff scoring average, an all-time record?",a:"33.4 PPG",w:["31.2 PPG","32.5 PPG","33.4 PPG","34.1 PPG"]},
      {q:"Which player had the highest usage rate in a single season at 38.8% in 2013-14?",a:"Kevin Durant",w:["Russell Westbrook","James Harden","Kevin Durant","Kobe Bryant"]},
      {q:"Joel Embiid's 33.1 PPG in 2022-23 was the highest MVP average since who?",a:"Allen Iverson (31.4 in 2001)",w:["Michael Jordan (30.1 in 1993)","Allen Iverson (31.4 in 2001)","Shaquille O'Neal (29.7)","Kobe Bryant (35.4 in 2006)"]},
      {q:"Which player averaged 40+ PPG over an entire season (1961-62)?",a:"Wilt Chamberlain (50.4, and also averaged 44.8 in 1962-63)",w:["Elgin Baylor","Wilt Chamberlain (50.4, and also averaged 44.8 in 1962-63)","Oscar Robertson","Jerry West"]},
      {q:"Who won the 2013 NBA MVP, averaging 28.1/10.0/7.3?",a:"LeBron James",w:["Kevin Durant","LeBron James","Carmelo Anthony","Chris Paul"]},
      {q:"Which team holds the record for the most losses in an NBA season?",a:"Charlotte Bobcats (7-59, 2011-12)",w:["Cleveland Cavaliers (17-65)","Charlotte Bobcats (7-59, 2011-12)","New Jersey Nets (12-70)","Dallas Mavericks (11-71)"]},
      {q:"LeBron's highest single-season PER was in 2009. What was it?",a:"31.7",w:["29.3","30.6","31.7","33.1"]},
      {q:"Kareem Abdul-Jabbar won 6 MVP awards. Who is second all-time with 5?",a:"Michael Jordan",w:["LeBron James","Bill Russell","Michael Jordan","Wilt Chamberlain"]},
      {q:"What is the record for most assists in a single NBA game?",a:"Scott Skiles (30 assists, 1990)",w:["Magic Johnson (24)","Bob Cousy (28)","Scott Skiles (30 assists, 1990)","John Stockton (25)"]},
      {q:"Which player won Finals MVP but his team still lost (has this ever happened)?",a:"No — Finals MVP has always gone to the winning team",w:["Jerry West (1969, unique case)","Wilt Chamberlain","No — Finals MVP has always gone to the winning team","Bill Russell"]},
      {q:"How many points did Kobe Bryant score in his legendary 81-point game in 2006?",a:"81 (vs. Toronto Raptors)",w:["72","76","81 (vs. Toronto Raptors)","88"]},
      {q:"Which player holds the record for highest True Shooting % in a single season (min. 1000 pts)?",a:"DeAndre Jordan (.710 in 2014-15)",w:["Shaquille O'Neal","Tyson Chandler","DeAndre Jordan (.710 in 2014-15)","Nikola Jokic"]},
    ],
  },
  nhl:{
    easy:[
      {q:"Who won the 2023 Hart Trophy (NHL MVP)?",a:"Connor McDavid",w:["Nathan MacKinnon","Connor McDavid","David Pastrnak","Leon Draisaitl"]},
      {q:"Which team won the 2023 Stanley Cup?",a:"Vegas Golden Knights",w:["Florida Panthers","Vegas Golden Knights","Carolina Hurricanes","Edmonton Oilers"]},
      {q:"Who was the 2023 Conn Smythe Trophy winner (playoff MVP)?",a:"Jonathan Marchessault",w:["William Karlsson","Mark Stone","Jonathan Marchessault","Adin Hill"]},
      {q:"How many Hart Trophies has Connor McDavid won as of 2024?",a:"3",w:["2","3","4","5"]},
      {q:"Who won the 2022 Hart Trophy?",a:"Auston Matthews",w:["Leon Draisaitl","Nathan MacKinnon","Auston Matthews","Connor McDavid"]},
      {q:"Which team won the 2022 Stanley Cup?",a:"Colorado Avalanche",w:["Tampa Bay Lightning","Colorado Avalanche","Edmonton Oilers","Carolina Hurricanes"]},
      {q:"Who was the 2022 Conn Smythe winner?",a:"Cale Makar",w:["Nathan MacKinnon","Mikko Rantanen","Cale Makar","Darcy Kuemper"]},
      {q:"Which team won back-to-back Stanley Cups in 2020 and 2021?",a:"Tampa Bay Lightning",w:["Montreal Canadiens","Tampa Bay Lightning","Colorado Avalanche","Florida Panthers"]},
      {q:"Who won the 2021 Hart Trophy?",a:"Connor McDavid",w:["Leon Draisaitl","Connor McDavid","Nathan MacKinnon","Auston Matthews"]},
      {q:"Who won the 2020 Hart Trophy?",a:"Leon Draisaitl",w:["Connor McDavid","Nathan MacKinnon","Leon Draisaitl","Alex Ovechkin"]},
      {q:"Alex Ovechkin holds the NHL record for most goals. How many as of 2024?",a:"893",w:["858","874","893","901"]},
      {q:"Who won the 2019 Stanley Cup with the Blues?",a:"St. Louis Blues (Ryan O'Reilly won Conn Smythe)",w:["Boston Bruins","St. Louis Blues (Ryan O'Reilly won Conn Smythe)","San Jose Sharks","Dallas Stars"]},
      {q:"Which team won the 2024 Stanley Cup?",a:"Florida Panthers",w:["Edmonton Oilers","Florida Panthers","New York Rangers","Carolina Hurricanes"]},
      {q:"Who won the 2024 Hart Trophy?",a:"Nathan MacKinnon",w:["Connor McDavid","Nikita Kucherov","Nathan MacKinnon","Auston Matthews"]},
      {q:"Leon Draisaitl won the 2020 Hart Trophy with what point total?",a:"110 points",w:["97 points","103 points","110 points","116 points"]},
      {q:"Who led the NHL in goals in 2022-23 with 60?",a:"David Pastrnak",w:["Connor McDavid","Leon Draisaitl","David Pastrnak","Tage Thompson"]},
      {q:"Which goalie won the Vezina Trophy in 2023?",a:"Linus Ullmark",w:["Igor Shesterkin","Andrei Vasilevskiy","Linus Ullmark","Juuse Saros"]},
      {q:"Who won the 2018 Hart Trophy?",a:"Taylor Hall",w:["Nikita Kucherov","Connor McDavid","Taylor Hall","Nathan MacKinnon"]},
      {q:"Which team won the 2018 Stanley Cup?",a:"Washington Capitals",w:["Vegas Golden Knights","Pittsburgh Penguins","Washington Capitals","Tampa Bay Lightning"]},
      {q:"Who won the 2024 Conn Smythe Trophy?",a:"Aleksander Barkov",w:["Sam Reinhart","Sergei Bobrovsky","Aleksander Barkov","Matthew Tkachuk"]},
    ],
    medium:[
      {q:"Connor McDavid's 2022-23 season — how many points did he record, the highest since Lemieux?",a:"153 points",w:["141","147","153 points","163"]},
      {q:"Which player scored 92 goals in 1981-82, the second-most in NHL history?",a:"Wayne Gretzky (who also scored 92 that year — Phil Esposito held the previous record with 76)",w:["Mike Bossy","Wayne Gretzky (who also scored 92 that year — Phil Esposito held the previous record with 76)","Mario Lemieux","Brett Hull"]},
      {q:"Nikita Kucherov set the record for most points in a single playoff year. How many?",a:"34 points (2019 playoffs)",w:["28","31","34 points (2019 playoffs)","37"]},
      {q:"Who won the Hart Trophy in 2019 with 128 points — his second Hart in a row?",a:"Nikita Kucherov",w:["Connor McDavid","Nikita Kucherov","Nathan MacKinnon","Taylor Hall"]},
      {q:"What year did Wayne Gretzky score his record 92 goals in a season?",a:"1981-82",w:["1979-80","1980-81","1981-82","1983-84"]},
      {q:"Which goalie had a .937 save percentage in 2021-22, winning the Vezina?",a:"Igor Shesterkin",w:["Andrei Vasilevskiy","Jake Oettinger","Igor Shesterkin","Thatcher Demko"]},
      {q:"Who won the Conn Smythe in 2021 leading Tampa to back-to-back cups?",a:"Andrei Vasilevskiy",w:["Nikita Kucherov","Brayden Point","Andrei Vasilevskiy","Victor Hedman"]},
      {q:"Nathan MacKinnon's 2022-23 season points total?",a:"111 points",w:["99","104","111 points","119"]},
      {q:"Which defenseman won the Norris Trophy in 2022 becoming one of the youngest ever?",a:"Cale Makar",w:["Adam Fox","Roman Josi","Cale Makar","Victor Hedman"]},
      {q:"How many points did Nikita Kucherov score in 2023-24 to lead the NHL?",a:"100 points",w:["87","93","100 points","108"]},
      {q:"Alex Ovechkin set the record for most power play goals in history. How many as of 2024?",a:"335",w:["298","312","335","354"]},
      {q:"Who won the Hart Trophy in both 2023 and 2024?",a:"Connor McDavid (2023) and Nathan MacKinnon (2024) — different winners",w:["Connor McDavid both years","Connor McDavid (2023) and Nathan MacKinnon (2024) — different winners","Nathan MacKinnon both years","Leon Draisaitl both years"]},
      {q:"Which player's 2020-21 season was historically anomalous — 85 points in 54 games while injured most of the year?",a:"Nikita Kucherov (ineligible for Hart due to IR loophole)",w:["Connor McDavid","Nikita Kucherov (ineligible for Hart due to IR loophole)","Leon Draisaitl","Artemi Panarin"]},
      {q:"Who won the Vezina Trophy in 2021 and 2022?",a:"Marc-Andre Fleury (2021) and Igor Shesterkin (2022)",w:["Andrei Vasilevskiy both years","Tuukka Rask (2021) and Igor Shesterkin (2022)","Marc-Andre Fleury (2021) and Igor Shesterkin (2022)","Juuse Saros both years"]},
      {q:"What was Auston Matthews' goal total in 2021-22, setting an American-born record?",a:"60 goals",w:["53","57","60 goals","64"]},
      {q:"Which team won three straight Stanley Cups from 2016-2018?",a:"No team — Pittsburgh won 2016 and 2017, Washington won 2018",w:["Pittsburgh Penguins (3 straight)","No team — Pittsburgh won 2016 and 2017, Washington won 2018","Tampa Bay Lightning","Chicago Blackhawks"]},
      {q:"Who won the 2021 Stanley Cup against the Montreal Canadiens?",a:"Tampa Bay Lightning",w:["Colorado Avalanche","Tampa Bay Lightning","Vegas Golden Knights","Carolina Hurricanes"]},
      {q:"What is Connor McDavid's career points per game, the highest in modern NHL history?",a:"1.48 PPG entering 2024",w:["1.31","1.38","1.48 PPG entering 2024","1.55"]},
      {q:"Which player became the fastest to 1,000 career points since Gretzky?",a:"Mario Lemieux",w:["Jaromir Jagr","Wayne Gretzky","Mario Lemieux","Steve Yzerman"]},
      {q:"Who won the 2017 Stanley Cup MVP playing for the Pittsburgh Penguins?",a:"Sidney Crosby",w:["Evgeni Malkin","Phil Kessel","Sidney Crosby","Matt Murray"]},
    ],
    hard:[
      {q:"Wayne Gretzky's all-time points record stands at 2,857. His ASSISTS ALONE (1,963) would be the all-time points record. True?",a:"True — his assists alone exceed every other player's total points",w:["False — Gordie Howe is second with 1,850 total points","True — his assists alone exceed every other player's total points","True — but only barely over Messier's 1,887","False — Jagr is second at 1,921 total points"]},
      {q:"Connor McDavid's 153-point 2022-23 season — whose record did it come closest to breaking?",a:"Mario Lemieux's 1995-96 mark of 161 points in 70 games",w:["Wayne Gretzky's 92-goal season","Mario Lemieux's 1995-96 mark of 161 points in 70 games","Steve Yzerman's 155 points in 1988-89","Brett Hull's 86 goals in 1990-91"]},
      {q:"Who holds the NHL record for most points in a single season by a defenseman?",a:"Bobby Orr (102 points, 1970-71)",w:["Paul Coffey (138 in 1985-86)","Denis Potvin (101)","Bobby Orr (102 points, 1970-71)","Al MacInnis (103)"]},
      {q:"Nikita Kucherov's 2023-24 regular season point total of 100 came despite missing significant time. Who led the NHL in points-per-game among qualifiers?",a:"Kucherov himself at 1.22 PPG",w:["Connor McDavid","Nathan MacKinnon","Kucherov himself at 1.22 PPG","Leon Draisaitl"]},
      {q:"Which goalie holds the record for most career wins in NHL history?",a:"Martin Brodeur (691 wins)",w:["Patrick Roy (551)","Martin Brodeur (691 wins)","Roberto Luongo (489)","Henrik Lundqvist (459)"]},
      {q:"How many Hart Trophies did Wayne Gretzky win in his career?",a:"9",w:["6","8","9","11"]},
      {q:"Who was the last player before McDavid to reach 150+ points in a season?",a:"Mario Lemieux (161 points in 1995-96)",w:["Jaromir Jagr (149 in 1995-96)","Steve Yzerman","Mario Lemieux (161 points in 1995-96)","Mark Messier"]},
      {q:"Cale Makar won the Norris Trophy in 2022 with how many points, a record for defensemen since Coffey?",a:"86 points",w:["74","79","86 points","92"]},
      {q:"Which goalie had a .942 SV% in 2014-15, the highest in the modern NHL?",a:"Carey Price",w:["Pekka Rinne","Ben Bishop","Carey Price","Tuukka Rask"]},
      {q:"Who scored 76 goals in 1992-93, the third-most in NHL history?",a:"Teemu Selanne",w:["Mario Lemieux","Brett Hull","Teemu Selanne","Luc Robitaille"]},
      {q:"Bobby Orr won the Norris Trophy how many consecutive times from 1967-1975?",a:"8 straight",w:["6 straight","7 straight","8 straight","All except one year"]},
      {q:"What is the record for most goals in a single NHL game by one player?",a:"7 goals (Joe Malone, 1920)",w:["5 goals (many players)","6 goals (Syd Howe, 1944)","7 goals (Joe Malone, 1920)","6 goals (Red Berenson, 1968)"]},
      {q:"Which team set the NHL record for most wins in a season in 2023-24?",a:"Florida Panthers",w:["New York Rangers","Florida Panthers","Vancouver Canucks","Colorado Avalanche"]},
      {q:"Nathan MacKinnon's 2022-23 regular season: his 111 points tied him with whom for 5th in Avs franchise history single-season points?",a:"Joe Sakic (1996-97)",w:["Peter Forsberg","Joe Sakic (1996-97)","Milan Hejduk","Paul Stastny"]},
      {q:"What does Gretzky's record of 92 goals in 1981-82 represent as goals-per-game rate?",a:"1.12 goals per game",w:["0.98 goals per game","1.05 goals per game","1.12 goals per game","1.18 goals per game"]},
    ],
  },
};

function shuffle(arr,rng){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function quickRng(){let s=Date.now()>>>0;return()=>{s=Math.imul(s^(s>>>13),s^(s<<7));s^=s>>>17;return(s>>>0)/4294967296;};}

// Strip parenthetical context from displayed choice text — scoring still uses full string
function cleanChoice(s){
  // Keep short parens like "(2019)" or "(unanimous)" — only strip long explanations
  return s.replace(/\s*\([^)]{30,}\)/g,"").replace(/\s*—[^"]{15,}/g,"").trim();
}

export default function TriviaPage({cu}){
  const mob=useIsMobile();
  const [sport,setSport]=useState(null);
  const [diff,setDiff]=useState(null);
  const [questions,setQuestions]=useState([]);
  const [qIdx,setQIdx]=useState(0);
  const [selected,setSelected]=useState(null);
  const [locked,setLocked]=useState(false);
  const [score,setScore]=useState(0);
  const [streak,setStreak]=useState(0);
  const [bestStreak,setBestStreak]=useState(0);
  const [results,setResults]=useState([]);
  const [phase,setPhase]=useState("pick"); // pick | diff | quiz | done

  const sportColor={mlb:"#22C55E",nfl:"#F97316",nba:"#3B82F6",nhl:"#A78BFA"};
  const sportEmoji={mlb:"⚾",nfl:"🏈",nba:"🏀",nhl:"🏒"};
  const diffColor={easy:"#22C55E",medium:"#F59E0B",hard:"#EF4444"};
  const diffIcon={easy:"🟢",medium:"🟡",hard:"🔴"};
  const ac=sport?sportColor[sport]:"#00D4FF";

  const pickSport=(s)=>{setSport(s);setPhase("diff");};

  const startQuiz=(s,d)=>{
    const rng=quickRng();
    const pool=shuffle(TRIVIA_Q[s][d],rng).slice(0,15);
    const qs=pool.map(q=>({...q,choices:shuffle(q.w,quickRng())}));
    setDiff(d);setQuestions(qs);setQIdx(0);setSelected(null);setLocked(false);
    setScore(0);setStreak(0);setBestStreak(0);setResults([]);setPhase("quiz");
  };

  const pick=(choice)=>{
    if(locked)return;
    setSelected(choice);setLocked(true);
    const q=questions[qIdx];
    const correct=choice===q.a;
    const ns=correct?streak+1:0;
    setBestStreak(b=>Math.max(b,ns));setStreak(ns);
    if(correct)setScore(s=>s+1);
    setResults(r=>[...r,{q:q.q,correct,chosen:choice,answer:q.a}]);
  };

  const saveStats=async(finalResults,finalScore)=>{
    if(!cu)return;
    const total=finalResults.length;
    const wrong=total-finalScore;
    try{
      // Upsert by updating cumulative totals
      const existing=await sb.get("nova_trivia_stats",`?user_id=eq.${cu.id}&limit=1`);
      if(existing&&existing.length>0){
        const e=existing[0];
        await sb.patch("nova_trivia_stats",{
          total_correct:e.total_correct+finalScore,
          total_wrong:e.total_wrong+wrong,
          total_questions:e.total_questions+total,
          games_played:e.games_played+1,
          last_played:Date.now(),
        },`?user_id=eq.${cu.id}`);
      } else {
        await sb.post("nova_trivia_stats",{
          id:gid(),user_id:cu.id,username:cu.username,display_name:cu.display_name,avatar:cu.avatar,avatar_url:cu.avatar_url,
          total_correct:finalScore,total_wrong:wrong,total_questions:total,games_played:1,last_played:Date.now()
        });
      }
    }catch(e){console.warn("Could not save trivia stats",e);}
  };

  const next=()=>{
    if(qIdx+1>=questions.length){
      const finalResults=[...results];
      // score state may lag, count directly
      const finalScore=finalResults.filter(r=>r.correct).length;
      saveStats(finalResults,finalScore);
      setPhase("done");return;
    }
    setQIdx(i=>i+1);setSelected(null);setLocked(false);
  };
  const quit=()=>{
    const finalResults=[...results];
    const finalScore=finalResults.filter(r=>r.correct).length;
    saveStats(finalResults,finalScore);
    setPhase("done");
  };
  const restart=()=>{setSport(null);setDiff(null);setPhase("pick");};

  // ── Pick sport ──
  if(phase==="pick") return(
    <div style={{maxWidth:480,margin:"0 auto",padding:mob?"24px 16px":"48px 20px",textAlign:"center"}}>
      <div style={{fontSize:mob?22:30,fontWeight:900,fontFamily:"'Orbitron',sans-serif",background:"linear-gradient(135deg,#00D4FF,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6,letterSpacing:".05em"}}>SPORTS TRIVIA</div>
      <div style={{fontSize:12,color:"#475569",marginBottom:32}}>MVP awards · stat records · championships — no basic questions</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {["mlb","nfl","nba","nhl"].map(s=>(
          <button key={s} onClick={()=>pickSport(s)} style={{padding:"26px 16px",borderRadius:16,border:`1.5px solid ${sportColor[s]}44`,background:`${sportColor[s]}0e`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,transition:"all .2s"}}>
            <div style={{fontSize:34}}>{sportEmoji[s]}</div>
            <div style={{fontSize:13,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:sportColor[s],letterSpacing:".08em"}}>{s.toUpperCase()}</div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{Object.values(TRIVIA_Q[s]).flat().length} QUESTIONS</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Pick difficulty ──
  if(phase==="diff") return(
    <div style={{maxWidth:420,margin:"0 auto",padding:mob?"24px 16px":"48px 20px",textAlign:"center"}}>
      <button onClick={()=>setPhase("pick")} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,marginBottom:20,display:"flex",alignItems:"center",gap:6,margin:"0 auto 20px"}}>← back</button>
      <div style={{fontSize:20,marginBottom:4}}>{sportEmoji[sport]}</div>
      <div style={{fontSize:mob?18:22,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:ac,marginBottom:6,letterSpacing:".06em"}}>{sport?.toUpperCase()} TRIVIA</div>
      <div style={{fontSize:12,color:"#475569",marginBottom:28}}>Choose your difficulty</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[["easy","Casual Fan","MVP winners, championship years, basic career stats"],["medium","Stats Head","Specific numbers, award details, multi-year trends"],["hard","Historian","Record-breaking stats, obscure facts, deep analytics"]].map(([d,label,desc])=>(
          <button key={d} onClick={()=>startQuiz(sport,d)} style={{padding:"18px 20px",borderRadius:14,border:`1.5px solid ${diffColor[d]}44`,background:`${diffColor[d]}0e`,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,transition:"all .2s"}}>
            <div style={{fontSize:24,flexShrink:0}}>{diffIcon[d]}</div>
            <div>
              <div style={{fontSize:13,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:diffColor[d],letterSpacing:".06em",marginBottom:3}}>{d.toUpperCase()} — {label}</div>
              <div style={{fontSize:11,color:"#64748B"}}>{desc}</div>
            </div>
            <div style={{marginLeft:"auto",fontSize:11,color:"#334155",fontFamily:"'Orbitron',sans-serif",flexShrink:0}}>{TRIVIA_Q[sport][d].length}Q</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Done ──
  if(phase==="done"){
    const total=results.length;
    const pct=total?Math.round((score/total)*100):0;
    const grade=pct>=93?"🏆 Immaculate":pct>=80?"⭐ Elite":pct>=67?"💪 Solid":pct>=50?"📚 Learning":"💀 Rough Game";
    return(
      <div style={{maxWidth:560,margin:"0 auto",padding:mob?"20px 14px":"40px 20px"}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{fontSize:44,marginBottom:8}}>{grade.split(" ")[0]}</div>
          <div style={{fontSize:mob?18:24,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:ac}}>{grade.slice(2)}</div>
          <div style={{fontSize:11,color:"#475569",marginTop:4,fontFamily:"'Orbitron',sans-serif"}}>{sport?.toUpperCase()} · {diff?.toUpperCase()} · {sportEmoji[sport]}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
          {[["CORRECT",`${score}/${total}`],["ACCURACY",`${pct}%`],["BEST STREAK",`${bestStreak}🔥`]].map(([label,val])=>(
            <div key={label} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,padding:"12px 6px",textAlign:"center"}}>
              <div style={{fontSize:8,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".07em",marginBottom:4}}>{label}</div>
              <div style={{fontSize:mob?15:19,fontWeight:900,color:ac,fontFamily:"'Orbitron',sans-serif"}}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"8px 14px",borderBottom:"1px solid rgba(255,255,255,.05)",fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em"}}>REVIEW</div>
          <div style={{maxHeight:260,overflowY:"auto"}}>
            {results.map((r,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"9px 14px",borderBottom:"1px solid rgba(255,255,255,.03)",alignItems:"flex-start"}}>
                <div style={{fontSize:13,flexShrink:0,marginTop:1}}>{r.correct?"✅":"❌"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,color:"#CBD5E1",lineHeight:1.3,marginBottom:2}}>{r.q}</div>
                  {!r.correct&&<div style={{fontSize:10,color:"#22C55E",marginBottom:1}}>✓ {r.answer}</div>}
                  {!r.correct&&<div style={{fontSize:10,color:"#EF4444"}}>✗ {r.chosen}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>startQuiz(sport,diff)} style={{flex:1,padding:"12px",borderRadius:10,background:ac,border:"none",color:"#000",fontWeight:900,fontSize:12,fontFamily:"'Orbitron',sans-serif",cursor:"pointer"}}>🔄 PLAY AGAIN</button>
          <button onClick={()=>setPhase("diff")} style={{flex:1,padding:"12px",borderRadius:10,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",color:"#94A3B8",fontWeight:700,fontSize:12,fontFamily:"'Orbitron',sans-serif",cursor:"pointer"}}>CHANGE DIFF</button>
          <button onClick={restart} style={{padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#64748B",fontSize:12,cursor:"pointer"}}>🏠</button>
        </div>
      </div>
    );
  }

  // ── Quiz ──
  const q=questions[qIdx];
  const progress=(qIdx/questions.length)*100;
  const correctFeedback=["Locked in! 🔒","That's right! 🎯","Nailed it! 🔥","Correct! ✅","No doubt! 💪","Easy money 💰","Big brain! 🧠"][Math.floor(Math.random()*7)];
  return(
    <div style={{maxWidth:580,margin:"0 auto",padding:mob?"16px 12px":"32px 20px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>{sportEmoji[sport]}</span>
          <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:diffColor[diff],fontWeight:700,letterSpacing:".06em"}}>{diff?.toUpperCase()}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {streak>=2&&<div style={{fontSize:11,color:"#F97316",fontWeight:700}}>{streak}🔥</div>}
          <div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{score}/{qIdx}</div>
          <button onClick={quit} style={{padding:"4px 10px",borderRadius:6,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"#EF4444",fontSize:9,fontFamily:"'Orbitron',sans-serif",cursor:"pointer",fontWeight:700}}>QUIT</button>
        </div>
      </div>
      <div style={{height:3,background:"rgba(255,255,255,.06)",borderRadius:2,marginBottom:18,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${ac},${ac}88)`,borderRadius:2,transition:"width .4s"}}/>
      </div>
      <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",marginBottom:8,letterSpacing:".1em"}}>Q {qIdx+1} / {questions.length}</div>
      <div style={{fontSize:mob?14:17,fontWeight:700,color:"#E2E8F0",lineHeight:1.45,marginBottom:20,minHeight:52}}>{q.q}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
        {q.choices.map((choice,i)=>{
          const isSel=selected===choice;
          const isCorr=choice===q.a;
          let bg="rgba(255,255,255,.03)",border="1px solid rgba(255,255,255,.08)",color="#CBD5E1";
          if(locked){
            if(isCorr){bg="rgba(34,197,94,.14)";border="1px solid rgba(34,197,94,.45)";color="#22C55E";}
            else if(isSel){bg="rgba(239,68,68,.14)";border="1px solid rgba(239,68,68,.4)";color="#EF4444";}
          } else if(isSel){bg=`${ac}1e`;border=`1px solid ${ac}77`;color="#E2E8F0";}
          return(
            <button key={i} onClick={()=>pick(choice)} disabled={locked}
              style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:10,background:bg,border,color,cursor:locked?"default":"pointer",textAlign:"left",transition:"all .15s",fontSize:mob?12:13,fontWeight:locked&&isCorr?700:400}}>
              <div style={{width:24,height:24,borderRadius:6,background:locked&&isCorr?"rgba(34,197,94,.25)":locked&&isSel&&!isCorr?"rgba(239,68,68,.25)":`${ac}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:locked&&isCorr?"#22C55E":locked&&isSel&&!isCorr?"#EF4444":ac,flexShrink:0}}>
                {locked&&isCorr?"✓":locked&&isSel&&!isCorr?"✗":["A","B","C","D"][i]}
              </div>
              {cleanChoice(choice)}
            </button>
          );
        })}
      </div>
      {locked&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{fontSize:12,fontWeight:700,color:selected===q.a?"#22C55E":"#EF4444",flex:1}}>
            {selected===q.a?correctFeedback:`❌ ${cleanChoice(q.a)}`}
          </div>
          <button onClick={next} style={{padding:"11px 22px",borderRadius:10,background:ac,border:"none",color:"#000",fontWeight:900,fontSize:11,fontFamily:"'Orbitron',sans-serif",cursor:"pointer",flexShrink:0,letterSpacing:".04em"}}>
            {qIdx+1>=questions.length?"RESULTS →":"NEXT →"}
          </button>
        </div>
      )}
    </div>
  );
}


