
import numpy
import sys
import time
import urllib2
import csv	
import os
import json
from util import *
from bs4 import BeautifulSoup

#Returns list of (player, win shares) tuples
def scrapeWinShares(url):
	soup= grabSiteData("http://www.basketball-reference.com"+url)
	advancedTable= soup.find('div', {"id" : "all_advanced"}).find('tbody')
	rows= advancedTable.findAll("tr")
	stats= {}
	totalWS= 0
	totalSalary= 0

	#add win shares to dicts
	for row in rows: 
		tds= row.findAll("td")
		player_name= tds[1].find("a").text.encode("ascii","ignore")

		if tds[-2].text != "":
			win_shares= float(tds[-2].text)
			totalWS += win_shares
			stats[player_name]= [win_shares]

	#add win share percentages to dicts
	for p in stats:
		ws= stats[p][-1]
		stats[p].append((ws/totalWS)*100)

	#add salaries to dicts
	salaryTable= soup.find('div', {"id" : "all_salaries"}).find('tbody')
	if salaryTable!=None:	
		rows= salaryTable.findAll("tr")
		for row in rows:
			player= row.find("a").text.encode("ascii","ignore")
			if player in stats:
				salary= row.findAll("td")[-1].text
				salary= int(salary.replace(",","").replace("$",""))
				stats[player].append(salary)
				totalSalary += salary

		#add salary percentages to dicts
		totalSalary= float(totalSalary)
		for p in stats:
			sal= stats[p][-1]
			if len(stats[p])>3:
				sal= 0
				for x in stats[p][2:]:
					sal += x
				stats[p]= stats[p][:2]+[sal]
			if len(stats[p])==3:
				stats[p].append((sal/totalSalary)*100)

	else:
		print yearFromURL(url)

	#convert stats dict to list of lists
	stats= [[x]+y for x,y in stats.items()]
	#print totalWS, totalSalary
	#for s in stats:
	#	print s
	return stats


#returns list of urls for the years in which given team existed
def getURLsOfTeam(team):
	soup= grabSiteData("http://www.basketball-reference.com/teams/"+team)
	rows= soup.find("tbody").findAll("tr")
	urls= []
	for row in rows:
		dat= row.findAll("td")
	 	season= dat[0].text
	 	url= dat[2].find("a")["href"].encode("ascii","ignore")
		urls += [url]
	return urls

#returns years in which team made conf finals, lost in finals, and won finals
def getSuccessfulYears(team):
	soup= grabSiteData("http://www.basketball-reference.com/teams/"+team)
	rows= soup.find("tbody").findAll("tr")
	conf_finals= []
	finals_loss= []
	finals_won= []
	for row in rows:
		dat= row.findAll("td")
		yr= yearFromURL(dat[2].find("a")["href"].encode("ascii","ignore"))
		result= dat[14].text
		if "Conf. Final" in result:
			conf_finals.append(yr)
		if "Lost Finals" in result: 
			finals_loss.append(yr)
		if "Won Finals" in result:
			finals_won.append(yr)
	return conf_finals, finals_loss, finals_won


#saves to teams/[team_name] csvs for each year where each line
#is of the form "[player_name] [win_shares]"
def recordWinSharesForTeam(team):
	currentDir= os.getcwd()
	urls= getURLsOfTeam(team)
	for url in urls:
		stats= scrapeWinShares(url)

		#create team direc if it doesn't exist
		if not os.path.exists(currentDir+'/'+team):
			print "Making new directory"
			os.makedirs(currentDir+'/'+team)

		listsToCSV(stats,currentDir+"/"+team+'/'+urlToFilename(url))
		print "Done year",url

def getWinSharesForTeam(team,year):
	currentDir= os.getcwd()
	lists= csvToLists(currentDir+'/'+team+'/'+str(year)+'.csv')
	return lists

def getBestWinSharePlayers(fn):
	currentDir= os.getcwd()
	playerTups= csvToLists(fn)

	total= 0
	for (p,ws) in playerTups:
		total += float(ws)

	bestToWorst= sorted(playerTups, key=lambda tup: float(tup[1]), reverse=True)
	bestPlayers= {"all":total}	
	tally= 0
	for (p,ws) in bestToWorst:
		tally += float(ws) 
		bestPlayers[p]= float(ws)
		if tally >= total/2:
			return bestPlayers

def calcEras(team):
	currentDir= os.getcwd()
	urls= getURLsOfTeam(team)[::-1] #reverses list

	currYear= 0
	eras= {}
	possibles= {}

	for url in urls:
		currYear= int(yearFromURL(url))
		bests= getBestWinSharePlayers(currentDir + '/' + team + '/' + urlToFilename(url))
		bests= [(k,v) for (k,v) in bests.iteritems() if k != "all"]
		bests= sorted(bests, key=lambda tup: float(tup[1]), reverse=True)
		eras[currYear]= set([bests[0]])
		possibles[currYear]= set(bests[:4])
		#print bests, bests[:3]

		if (currYear-2 in possibles):
			for player in possibles[currYear]:
				tmp= [p for (p,ws) in possibles[currYear-2]]
				if (player[0] in tmp): #or (player in possibles[currYear-1]):
					eras[currYear-2].add(player)
					eras[currYear-1].add(player)
					eras[currYear].add(player)

	eras= sorted(eras.items(), key=lambda tup: int(tup[0]))
	collapsed= []
	byPlayer= {}
	yearSpan= [eras[0][0]]
	currPlayers= sorted(list(set([p for (p,ws) in eras[0][1]])))
	for yr,p in eras:
		playerList= sorted(list(set([y for (y,ws) in p])))
		for play in playerList:
			byPlayer[play]= byPlayer.get(play,[]) + [yr]
		if playerList==currPlayers:
			yearSpan.append(yr)
		else:
			collapsed.append({"years":yearSpan, "players":currPlayers})
			yearSpan= [yr]
			currPlayers= playerList
	collapsed.append({"years":yearSpan, "players":currPlayers})
	for x in collapsed:
		print x

	for x,y in sorted(byPlayer.items(), key=lambda tup: tup[1][0]):
		print x,y

	return sorted(byPlayer.items(), key=lambda tup: tup[1][0])

def getPlayerSeasonStats(player,year):
	pass

def allDataToJSON():
	currentDir= os.getcwd()
	jsonList= []

	teamNames= getImmediateSubdirectories(currentDir)
	teamNames.remove("d3")
	for team in teamNames:
		info= {"team":team, "eras": [], "confFinal": [], "lossFinal": [], "champion": []}
		print team
		eras= calcEras(team)
		for (p,yrs) in eras:
			info["eras"].append({"player":p, "stats":[]})
			for y in yrs:
				season= '\''+str(y-1)[-2:]+'-\''+str(y)[-2:]
				info["eras"][-1]["stats"].append({"name":p, "year":y, "season":season})
		cf,lf,c= getSuccessfulYears(team)
		info["confFinal"]= cf
		info["lossFinal"]= lf
		info["champion"]= c
		jsonList.append(info)

	with open(currentDir+'/eras.json', 'w') as outfile:
		json.dump(jsonList, outfile)


if __name__ == "__main__":
	start= time.time()
	teams= ["ATL", "BOS", "BRK", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW", "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK", "OKC", "ORL", "PHI", "PHO", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"]
	recordWinSharesForTeam("ATL")
	print "Time taken:", time.time()-start