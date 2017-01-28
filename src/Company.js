//Netburner Company class
//	Note: Company Positions can be loaded every time with init() but Company class needs
//		  to be saved/loaded from localStorage
function Company() {
	this.companyName 		= "";
    this.companyPositions 	= [];	//Names (only name, not object) of all company positions
	this.salaryMultiplier	= 1;	//Multiplier for base salary
	this.expMultiplier 		= 1;	//Multiplier for base exp gain
    
    //Player-related properties for company
    this.isPlayerEmployed 	= false;
    this.playerPosition 	= "";	//Name (only name, not object) of the current position player holds
    this.playerReputation 	= 0;  //"Reputation" within company, gain reputation by working for company
	
};

Company.prototype.init = function(name, salaryMult, expMult) {
	this.companyName 	    = name;
	this.salaryMultiplier 	= salaryMult;
	this.expMultiplier 		= expMult;
}

Company.prototype.addPosition = function(pos) {
	this.companyPositions.push(pos.positionName); //Company object holds only name of positions
}

Company.prototype.addPositions = function(positions) {
	for (var i = 0; i < positions.length; i++) {
		this.addPosition(positions[i]);
	}
}

Company.prototype.toJSON = function() {
	return Generic_toJSON("Company", this);
}

Company.fromJSON = function(value) {
	return Generic_fromJSON(Company, value.data);
}

Reviver.constructors.Company = Company;

//Object that defines a position within a Company and its requirements
function CompanyPosition(name, reqHack, reqStr, reqDef, reqDex, reqAgi, reqCha, reqRep, salary) {
    this.positionName       = name;
    this.requiredHacking    = reqHack;
    this.requiredStrength   = reqStr;
    this.requiredDefense    = reqDef;
    this.requiredDexterity  = reqDex;
    this.requiredAgility    = reqAgi;
	this.requiredCharisma 	= reqCha;
	this.requiredReputation = reqRep;
	
	//Base salary for a position. This will be multiplied by a company-specific multiplier. Better companies will have
	//higher multipliers.
	//
	//NOTE: This salary denotes the $ gained every loop (200 ms)
	this.baseSalary 		= salary;
};

//Set the parameters that are used to determine how good/effective the Player is at a job. 
//The Player's "effectiveness" at a job determines how much reputation he gains when he works
//
//NOTE: These parameters should total to 100, such that each parameter represents a "weighting" of how
//		important that stat/skill is for the job
CompanyPosition.prototype.setPerformanceParameters = function(hackEff, strEff, defEff, dexEff, agiEff, chaEff) {
	if (hackEff + strEff + defEff + dexEff + agiEff + chaEff != 100) {
		console.log("CompanyPosition.setPerformanceParameters() arguments do not total to 100");
		return;
	}
	this.hackingEffectiveness 	= hackEff;
	this.strengthEffectiveness 	= strEff;
	this.defenseEffectiveness 	= defEff;
	this.dexterityEffectiveness = dexEff;
	this.agilityEffectiveness 	= agiEff;
	this.charismaEffectiveness 	= chaEff;
}

//Set the stat/skill experience a Player should gain for working at a CompanyPosition. The experience is per game loop (200 ms)
//These will be constant for a single position, but is affected by a company-specific multiplier
CompanyPosition.prototype.setExperienceGains = function(hack, str, def, dex, agi, cha) {
	this.hackingExpGain 		= hack;
	this.strengthExpGain 		= str;
	this.defenseExpGain 		= def;
	this.dexterityExpGain 		= dex;
	this.agilityExpGain 		= agi;
	this.charismaExpGain 		= cha;
}

//Calculate a player's effectiveness at a certain job. Returns the amount of job reputation
//that should be gained every game loop (200 ms)
CompanyPosition.prototype.calculateJobPerformance = function(hacking, str, def, dex, agi, cha) {
	var hackRatio 	= this.hackingEffectiveness * hacking / CONSTANTS.MaxSkillLevel;
	var strRatio  	= this.strengthEffectiveness * str / CONSTANTS.MaxSkillLevel;
	var defRatio 	= this.defenseEffectiveness * def / CONSTANTS.MaxSkillLevel;
	var dexRatio 	= this.dexterityEffectiveness * dex / CONSTANTS.MaxSkillLevel;
	var agiRatio 	= this.agilityEffectiveness * agi / CONSTANTS.MaxSkillLevel;
	var chaRatio 	= this.charismaEffectiveness * cha / CONSTANTS.MaxSkillLevel;
	return (hackRatio + strRatio + defRatio + dexRatio + agiRatio + chaRatio) / 100;
}

CompanyPositions = {
	//Constructor: CompanyPosition(name, reqHack, reqStr, reqDef, reqDex, reqAgi, reqCha, reqRep, salary)

	//Software
	SoftwareIntern: 			new CompanyPosition("Software Engineering Intern", 1, 1, 1, 1, 1, 1, 0, 1),
	JuniorDev: 					new CompanyPosition("Junior Software Engineer", 50, 1, 1, 1, 1, 1, 9000, 5),
	SeniorDev: 					new CompanyPosition("Senior Software Engineer", 250, 1, 1, 1, 1, 50, 36000, 12),
	LeadDev: 					new CompanyPosition("Lead Software Developer", 400, 1, 1, 1, 1, 100, 72000, 15),
	
	//Security
	ITIntern: 					new CompanyPosition("IT Intern", 1, 1, 1, 1, 1, 1, 0, .8),
	ITAnalyst:					new CompanyPosition("IT Analyst", 25, 1, 1, 1, 1, 1, 9000, 2),
	ITManager:					new CompanyPosition("IT Manager", 150, 1, 1, 1, 1, 50, 36000, 8),
	SysAdmin:					new CompanyPosition("Systems Administrator", 250, 1, 1, 1, 1, 75, 72000, 13),
	SecurityEngineer: 			new CompanyPosition("Security Engineer", 150, 1, 1, 1, 1, 25, 36000, 10),
	NetworkEngineer:			new CompanyPosition("Network Engineer", 150, 1, 1, 1, 1, 25, 36000, 10),
	NetworkAdministrator: 		new CompanyPosition("Network Administrator", 250, 1, 1, 1, 1, 75, 72000, 12),
	
	//Technology management
	HeadOfSoftware: 			new CompanyPosition("Head of Software", 500, 1, 1, 1, 1, 250, 108000, 30),
	HeadOfEngineering: 			new CompanyPosition("Head of Engineering", 500, 1, 1, 1, 1, 250, 10800, 30),
	VicePresident: 				new CompanyPosition("Vice President of Technology", 600, 1, 1, 1, 1, 400, 144000, 40),
	CTO: 						new CompanyPosition("Chief Technology Officer", 750, 1, 1, 1, 1, 500, 216000, 50),
	
	//Business
	BusinessIntern:				new CompanyPosition("Business Intern", 1, 1, 1, 1, 1, 1, 0, 1),
	BusinessAnalyst: 			new CompanyPosition("Business Analyst", 5, 1, 1, 1, 1, 50, 9000, 5),
	BusinessManager:			new CompanyPosition("Business Manager", 50, 1, 1, 1, 1, 100, 36000, 12),
	OperationsManager: 			new CompanyPosition("Operations Manager", 50, 1, 1, 1, 1, 200, 72000, 20),
	CFO:						new CompanyPosition("Chief Financial Officer", 75, 1, 1, 1, 1, 500, 108000, 50),
	CEO:						new CompanyPosition("Chief Executive Officer", 100, 1, 1, 1, 1, 750, 216000, 100),
	
	//Non-tech/management jobs
	Waiter:						new CompanyPosition("Waiter", 1, 1, 1, 1, 1, 1, 0, .5),
	Employee: 					new CompanyPosition("Employee", 1, 1, 1, 1, 1, 1, 0, .5),
	SecurityGuard: 				new CompanyPosition("Security Guard", 1, 50, 50, 50, 50, 0, 3),
	PoliceOfficer: 				new CompanyPosition("Police Officer", 10, 100, 100, 100, 100, 9000, 4),
	SecurityOfficer: 			new CompanyPosition("Security Officer", 25, 150, 150, 150, 150, 9000, 6),
	SecuritySupervisor: 		new CompanyPosition("Security Supervisor", 25, 250, 250, 250, 250, 36000, 12),
	HeadOfSecurity: 			new CompanyPosition("Head of Security", 50, 500, 500, 500, 500, 72000, 20),
	FieldAgent: 				new CompanyPosition("Field Agent", 100, 100, 100, 100, 100, 9000, 4),
	SecretAgent: 				new CompanyPosition("Secret Agent", 200, 250, 250, 250, 250, 36000, 10),
	SpecialOperative: 			new CompanyPosition("Special Operative", 250, 500, 500, 500, 500, 108000, 20),
	
	init: function() {
		//Argument order: hack, str, def, dex, agi, cha
		//Software
		CompanyPositions.SoftwareIntern.setPerformanceParameters(90, 0, 0, 0, 0, 10);
		CompanyPositions.SoftwareIntern.setExperienceGains(.1, 0, 0, 0, 0, .02);
		CompanyPositions.JuniorDev.setPerformanceParameters(85, 0, 0, 0, 0, 15);
		CompanyPositions.JuniorDev.setExperienceGains(.2, 0, 0, 0, 0, .04);
		CompanyPositions.SeniorDev.setPerformanceParameters(75, 0, 0, 0, 0, 25);
		CompanyPositions.SeniorDev.setExperienceGains(.4, 0, 0, 0, 0, .08);
		CompanyPositions.LeadDev.setPerformanceParameters(70, 0, 0, 0, 0, 30);
		CompanyPositions.LeadDev.setExperienceGains(.5, 0, 0, 0, 0, .1);
		
		//Security
		CompanyPositions.ITIntern.setPerformanceParameters(90, 0, 0, 0, 0, 10);
		CompanyPositions.ITIntern.setExperienceGains(.05, 0, 0, 0, 0, .01);
		CompanyPositions.ITAnalyst.setPerformanceParameters(85, 0, 0, 0, 0, 15);
		CompanyPositions.ITAnalyst.setExperienceGains(.15, 0, 0, 0, 0, .02);
		CompanyPositions.ITManager.setPerformanceParameters(75, 0, 0, 0, 0, 25);
		CompanyPositions.ITManager.setExperienceGains(.4, 0, 0, 0, 0, .1);
		CompanyPositions.SysAdmin.setPerformanceParameters(80, 0, 0, 0, 0, 20);
		CompanyPositions.SysAdmin.setExperienceGains(.5, 0, 0, 0, 0, .05);
		CompanyPositions.SecurityEngineer.setPerformanceParameters(85, 0, 0, 0, 0, 15);
		CompanyPositions.SecurityEngineer.setExperienceGains(0.4, 0, 0, 0, 0, .05);
		CompanyPositions.NetworkEngineer.setPerformanceParameters(85, 0, 0, 0, 0, 15);
		CompanyPositions.NetworkEngineer.setExperienceGains(0.4, 0, 0, 0, 0, .05);
		CompanyPositions.NetworkAdministrator.setPerformanceParameters(75, 0, 0, 0, 0, 25);
		CompanyPositions.NetworkAdministrator.setExperienceGains(0.5, 0, 0, 0, 0, .1);
		
		//Technology management
		CompanyPositions.HeadOfSoftware.setPerformanceParameters(65, 0, 0, 0, 0, 35);
		CompanyPositions.HeadOfSoftware.setExperienceGains(1, 0, 0, 0, 0, .5);
		CompanyPositions.HeadOfEngineering.setPerformanceParameters(60, 0, 0, 0, 0, 40);
		CompanyPositions.HeadOfEngineering.setExperienceGains(1.1, 0, 0, 0, 0, .5);
		CompanyPositions.VicePresident.setPerformanceParameters(60, 0, 0, 0, 0, 40);
		CompanyPositions.VicePresident.setExperienceGains(1.2, 0, 0, 0, 0, .6);
		CompanyPositions.CTO.setPerformanceParameters(50, 0, 0, 0, 0, 50);
		CompanyPositions.CTO.setExperienceGains(1.5, 0, 0, 0, 1);
		
		//Business
		CompanyPositions.BusinessIntern.setPerformanceParameters(10, 0, 0, 0, 0, 90);
		CompanyPositions.BusinessIntern.setExperienceGains(.01, 0, 0, 0, 0, .1);
		CompanyPositions.BusinessAnalyst.setPerformanceParameters(20, 0, 0, 0, 0, 80);
		CompanyPositions.BusinessAnalyst.setExperienceGains(.02, 0, 0, 0, 0, .2);
		CompanyPositions.BusinessManager.setPerformanceParameters(15, 0, 0, 0, 0, 85);
		CompanyPositions.BusinessManager.setExperienceGains(.02, 0, 0, 0, 0, .4);
		CompanyPositions.OperationsManager.setPerformanceParameters(15, 0, 0, 0, 0, 85);
		CompanyPositions.OperationsManager.setExperienceGains(.02, 0, 0, 0, 0, .4);
		CompanyPositions.CFO.setPerformanceParameters(10, 0, 0, 0, 0, 90);
		CompanyPositions.CFO.setExperienceGains(.05, 0, 0, 0, 0, 1);
		CompanyPositions.CEO.setPerformanceParameters(10, 0, 0, 0, 0, 90);
		CompanyPositions.CEO.setExperienceGains(.1, 0, 0, 0, 0, 1.5);
		
		//Non-tech/management jobs
		//TODO These parameters might need to be balanced
		CompanyPositions.Waiter.setPerformanceParameters(0, 10, 0, 10, 10, 70);
		CompanyPositions.Waiter.setExperienceGains(0, .01, .01, .01, .01, .05);
		CompanyPositions.Employee.setPerformanceParameters(0, 10, 0, 10, 10, 70);
		CompanyPositions.Employee.setExperienceGains(0, .01, .01, .01, .01, .05);
		CompanyPositions.SecurityGuard.setPerformanceParameters(5, 20, 20, 20, 20, 15);
		CompanyPositions.SecurityGuard.setExperienceGains(.01, .02, .02, .02, .02, .01);
		CompanyPositions.PoliceOfficer.setPerformanceParameters(5, 20, 20, 20, 20, 15);
		CompanyPositions.PoliceOfficer.setExperienceGains(.01, .04, .04, .04, .04, .02);
		CompanyPositions.SecurityOfficer.setPerformanceParameters(10, 20, 20, 20, 20, 10);
		CompanyPositions.SecurityOfficer.setExperienceGains(.02, .06, .06, .06, .06, .04);
		CompanyPositions.SecuritySupervisor.setPerformanceParameters(10, 15, 15, 15, 15, 30);
		CompanyPositions.SecuritySupervisor.setExperienceGains(.02, .06, .06, .06, .06, .08);
		CompanyPositions.HeadOfSecurity.setPerformanceParameters(10, 15, 15, 15, 15, 30);
		CompanyPositions.HeadOfSecurity.setExperienceGains(.05, .1, .1, .1, .1, .1);
		CompanyPositions.FieldAgent.setPerformanceParameters(10, 15, 15, 20, 20, 20);
		CompanyPositions.FieldAgent.setExperienceGains(.04, .06, .06, .06, .06, .04);
		CompanyPositions.SecretAgent.setPerformanceParameters(15, 15, 15, 20, 20, 15);
		CompanyPositions.SecretAgent.setExperienceGains(.08, .1, .1, .1, .1, .08);
		CompanyPositions.SpecialOperative.setPerformanceParameters(15, 15, 15, 20, 20, 15);
		CompanyPositions.SpecialOperative.setExperienceGains(.12, .15, .15, .15, .15, .12);
	}
}

/* Initialize all companies. Only called when creating new game. Otherwise companies are
 * usually loaded from localStorage */
initCompanies = function() {
	/* Companies that also have servers */
	//Megacorporations
	var ECorp = new Company();
	ECorp.init("ECorp", 3.0, 3.0);
	ECorp.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.ITIntern, CompanyPositions.BusinessIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SysAdmin,
		CompanyPositions.SecurityEngineer, CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.HeadOfEngineering,
		CompanyPositions.VicePresident, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager, CompanyPositions.CFO,
		CompanyPositions.CEO, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity]);
	AddToCompanies(ECorp);
	
	var MegaCorp = new Company();
	MegaCorp.init("MegaCorp", 3.0, 3.0);
	MegaCorp.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.ITIntern, CompanyPositions.BusinessIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SysAdmin,
		CompanyPositions.SecurityEngineer, CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.HeadOfEngineering,
		CompanyPositions.VicePresident, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager, CompanyPositions.CFO,
		CompanyPositions.CEO, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity]);
	AddToCompanies(MegaCorp);
	
	var BachmanAndAssociates = new Company();
	BachmanAndAssociates.init("Bachman & Associates", 2.6, 2.6);
	BachmanAndAssociates.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.ITIntern, CompanyPositions.BusinessIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SysAdmin,
		CompanyPositions.SecurityEngineer, CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.HeadOfEngineering,
		CompanyPositions.VicePresident, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager, CompanyPositions.CFO,
		CompanyPositions.CEO, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity]);
	AddToCompanies(BachmanAndAssociates);
	
	var BladeIndustries = new Company();
	BladeIndustries.init("Blade Industries", 2.75, 2.75);		
	BladeIndustries.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.ITIntern, CompanyPositions.BusinessIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SysAdmin,
		CompanyPositions.SecurityEngineer, CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.HeadOfEngineering,
		CompanyPositions.VicePresident, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager, CompanyPositions.CFO,
		CompanyPositions.CEO, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity]);
	AddToCompanies(BladeIndustries);
	
	var NWO = new Company();
	NWO.init("NWO", 2.75, 2.75);
	NWO.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.ITIntern, CompanyPositions.BusinessIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SysAdmin,
		CompanyPositions.SecurityEngineer, CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.HeadOfEngineering,
		CompanyPositions.VicePresident, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager, CompanyPositions.CFO,
		CompanyPositions.CEO, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity]);
	AddToCompanies(NWO);
	
	var ClarkeIncorporated = new Company();
	ClarkeIncorporated.init("Clarke Incorporated", 2.25, 2.25);
	ClarkeIncorporated.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.ITIntern, CompanyPositions.BusinessIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SysAdmin,
		CompanyPositions.SecurityEngineer, CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.HeadOfEngineering,
		CompanyPositions.VicePresident, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager, CompanyPositions.CFO,
		CompanyPositions.CEO, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity]);
	AddToCompanies(ClarkeIncorporated);
	
	var OmniTekIncorporated = new Company();
	OmniTekIncorporated.init("OmniTek Incorporated", 2.25, 2.25);
	OmniTekIncorporated.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.ITIntern, CompanyPositions.BusinessIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SysAdmin,
		CompanyPositions.SecurityEngineer, CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.HeadOfEngineering,
		CompanyPositions.VicePresident, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager, CompanyPositions.CFO,
		CompanyPositions.CEO, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity]);
	AddToCompanies(OmniTekIncorporated);
	
	var FourSigma = new Company();
	FourSigma.init("Four Sigma", 2.5, 2.5);
	FourSigma.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.ITIntern, CompanyPositions.BusinessIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SysAdmin,
		CompanyPositions.SecurityEngineer, CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.HeadOfEngineering,
		CompanyPositions.VicePresident, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager, CompanyPositions.CFO,
		CompanyPositions.CEO, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity]);
	AddToCompanies(FourSigma);
	
	var KuaiGongInternational = new Company();
	KuaiGongInternational.init("KuaiGong International", 2.2, 2.2);
	KuaiGongInternational.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.ITIntern, CompanyPositions.BusinessIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SysAdmin,
		CompanyPositions.SecurityEngineer, CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.HeadOfEngineering,
		CompanyPositions.VicePresident, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager, CompanyPositions.CFO,
		CompanyPositions.CEO, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity]);
	AddToCompanies(KuaiGongInternational);
	
	//Technology and communication companies ("Large" servers)
	var FulcrumTechnologies = new Company();
	FulcrumTechnologies.init("Fulcrum Technologies", 2.0, 2.0);
	FulcrumTechnologies.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.ITIntern, CompanyPositions.BusinessIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SysAdmin,
		CompanyPositions.SecurityEngineer, CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.HeadOfEngineering,
		CompanyPositions.VicePresident, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager, CompanyPositions.CFO,
		CompanyPositions.CEO]);
	AddToCompanies(FulcrumTechnologies);
	
	var StormTechnologies = new Company();
	StormTechnologies.init("Storm Technologies", 1.8, 1.8);
	StormTechnologies.addPositions([
		CompanyPositions.SoftwareIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SysAdmin,
		CompanyPositions.SecurityEngineer, CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.HeadOfEngineering,
		CompanyPositions.VicePresident, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager, CompanyPositions.CFO,
		CompanyPositions.CEO]);
	AddToCompanies(StormTechnologies);
	
	var DefComm = new Company();
	DefComm.init("DefComm", 1.75, 1.75);
	DefComm.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.CTO, CompanyPositions.CFO, CompanyPositions.CEO]);
	AddToCompanies(DefComm);
	
	var HeliosLabs =  new Company();
	HeliosLabs.init("Helios Labs", 1.8, 1.8);
	HeliosLabs.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.CTO, CompanyPositions.CFO, CompanyPositions.CEO]);
	AddToCompanies(HeliosLabs); 
	
	var VitaLife = new Company();
	VitaLife.init("VitaLife", 1.8, 1.8);
	VitaLife.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.CTO, CompanyPositions.BusinessManager,
		CompanyPositions.OperationsManager, CompanyPositions.CFO, CompanyPositions.CEO]);
	AddToCompanies(VitaLife);
	
	var IcarusMicrosystems = new Company();
	IcarusMicrosystems.init("Icarus Microsystems", 1.9, 1.9);
	IcarusMicrosystems.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.CTO, CompanyPositions.BusinessManager,
		CompanyPositions.OperationsManager, CompanyPositions.CFO, CompanyPositions.CEO]);
	AddToCompanies(IcarusMicrosystems);
	
	var UniversalEnergy = new Company();
	UniversalEnergy.init("Universal Energy", 2.0, 2.0);
	UniversalEnergy.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.CTO, CompanyPositions.BusinessManager,
		CompanyPositions.OperationsManager, CompanyPositions.CFO, CompanyPositions.CEO]);
	AddToCompanies(UniversalEnergy); 
	
	var GalacticCybersystems = new Company();
	GalacticCybersystems.init("Galactic Cybersystems", 1.9, 1.9);
	GalacticCybersystems.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.CTO, CompanyPositions.BusinessManager,
		CompanyPositions.OperationsManager, CompanyPositions.CFO, CompanyPositions.CEO]);
	AddToCompanies(GalacticCybersystems);
	
	//Defense Companies ("Large" Companies)
	var AeroCorp = new Company();
	AeroCorp.init("AeroCorp", 1.7, 1.7);
	AeroCorp.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.CTO,
		CompanyPositions.OperationsManager, CompanyPositions.CFO, CompanyPositions.CEO,
		CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer, CompanyPositions.SecuritySupervisor,
		CompanyPositions.HeadOfSecurity]);
	AddToCompanies(AeroCorp);
	
	var OmniaCybersystems = new Company();
	OmniaCybersystems.init("Omnia Cybersystems", 1.7, 1.7);
	OmniaCybersystems.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.CTO,
		CompanyPositions.OperationsManager, CompanyPositions.CFO, CompanyPositions.CEO,
		CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer, CompanyPositions.SecuritySupervisor,
		CompanyPositions.HeadOfSecurity]);
	AddToCompanies(OmniaCybersystems);
	
	var SolarisSpaceSystems = new Company();
	SolarisSpaceSystems.init("Solaris Space Systems", 1.7, 1.7);
	SolarisSpaceSystems.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.CTO,
		CompanyPositions.OperationsManager, CompanyPositions.CFO, CompanyPositions.CEO,
		CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer, CompanyPositions.SecuritySupervisor,
		CompanyPositions.HeadOfSecurity]);
	AddToCompanies(SolarisSpaceSystems);
	
	var DeltaOne = new Company();
	DeltaOne.init("Delta One", 1.6, 1.6);
	DeltaOne.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.CTO,
		CompanyPositions.OperationsManager, CompanyPositions.CFO, CompanyPositions.CEO,
		CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer, CompanyPositions.SecuritySupervisor,
		CompanyPositions.HeadOfSecurity]);
	AddToCompanies(DeltaOne);
	
	//Health, medicine, pharmaceutical companies ("Large" servers)
	var GlobalPharmaceuticals = new Company();
	GlobalPharmaceuticals.init("Global Pharmaceuticals", 1.8, 1.8);
	GlobalPharmaceuticals.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.ITIntern, CompanyPositions.BusinessIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager,
		CompanyPositions.CFO, CompanyPositions.CEO, CompanyPositions.SecurityGuard,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity]);
	AddToCompanies(GlobalPharmaceuticals);
	
	var NovaMedical = new Company();
	NovaMedical.init("Nova Medical", 1.75, 1.75);
	NovaMedical.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.ITIntern, CompanyPositions.BusinessIntern,
		CompanyPositions.JuniorDev, CompanyPositions.SeniorDev, CompanyPositions.LeadDev,
		CompanyPositions.ITAnalyst, CompanyPositions.ITManager, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator,
		CompanyPositions.HeadOfSoftware, CompanyPositions.CTO, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager,
		CompanyPositions.CFO, CompanyPositions.CEO, CompanyPositions.SecurityGuard,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity]);
	AddToCompanies(NovaMedical);

	//Other large companies
	var CIA = new Company(); 
	CIA.init("Central Intelligence Agency", 2.0, 2.0);
	CIA.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst,
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity, CompanyPositions.FieldAgent,
		CompanyPositions.SecretAgent, CompanyPositions.SpecialOperative]);
	AddToCompanies(CIA);
	
	var NSA = new Company();
	NSA.init("National Security Agency", 2.0, 2.0);
	NSA.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst,
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity, CompanyPositions.FieldAgent,
		CompanyPositions.SecretAgent, CompanyPositions.SpecialOperative]);
	AddToCompanies(NSA);
	
	var WatchdogSecurity = new Company();
	WatchdogSecurity.init("Watchdog Securty", 1.5, 1.5);
	WatchdogSecurity.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst,
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity, CompanyPositions.FieldAgent,
		CompanyPositions.SecretAgent, CompanyPositions.SpecialOperative]);
	AddToCompanies(WatchdogSecurity);
	
	//"Medium level" companies
	var LexoCorp = new Company();
	LexoCorp.init("LexoCorp", 1.4, 1.4);
	LexoCorp.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst,
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.HeadOfSoftware, CompanyPositions.CTO,
		CompanyPositions.BusinessIntern, CompanyPositions.BusinessAnalyst,
		CompanyPositions.OperationsManager, CompanyPositions.CFO, CompanyPositions.CEO, 
		CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer, CompanyPositions.HeadOfSecurity]);
	AddToCompanies(LexoCorp);
	
	var RhoConstruction = new Company();
	RhoConstruction.init("Rho Construction", 1.3, 1.3);
	RhoConstruction.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.BusinessIntern, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager]);
	AddToCompanies(RhoConstruction);
	
	var AlphaEnterprises = new Company();
	AlphaEnterprises.init("Alpha Enterprises", 1.5, 1.5);
	AlphaEnterprises.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.BusinessIntern, CompanyPositions.BusinessAnalyst,
		CompanyPositions.BusinessManager, CompanyPositions.OperationsManager]);
	AddToCompanies(AlphaEnterprises);
	
	var AevumPolice = new Company();
	AevumPolice.init("Aevum Police", 1.3, 1.3);
	AevumPolice.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.SecurityGuard, CompanyPositions.PoliceOfficer]);
	AddToCompanies(AevumPolice);
	
	var SysCoreSecurities = new Company();
	SysCoreSecurities.init("SysCore Securities", 1.3, 1.3);
	SysCoreSecurities.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.CTO]);
	AddToCompanies(SysCoreSecurities);
	
	var CompuTek = new Company();
	CompuTek.init("CompuTek", 1.2, 1.2);
	CompuTek.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.CTO]);
	AddToCompanies(CompuTek);
	
	var NetLinkTechnologies = new Company();
	NetLinkTechnologies.init("NetLink Technologies", 1.2, 1.2);
	NetLinkTechnologies.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst, 
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.CTO]);
	AddToCompanies(NetLinkTechnologies);
	
	var CarmichaelSecurity = new Company();
	CarmichaelSecurity.init("Carmichael Security", 1.2, 1.2);
	CarmichaelSecurity.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst,
		CompanyPositions.ITManager, CompanyPositions.SysAdmin, CompanyPositions.SecurityEngineer,
		CompanyPositions.NetworkEngineer, CompanyPositions.NetworkAdministrator, CompanyPositions.HeadOfSoftware,
		CompanyPositions.HeadOfEngineering, CompanyPositions.SecurityGuard, CompanyPositions.SecurityOfficer,
		CompanyPositions.SecuritySupervisor, CompanyPositions.HeadOfSecurity, CompanyPositions.FieldAgent,
		CompanyPositions.SecretAgent, CompanyPositions.SpecialOperative]);
	AddToCompanies(CarmichaelSecurity);
	
	//"Low level" companies
	var FoodNStuff = new Company(); 
	FoodNStuff.init("FoodNStuff", 1, 1);
	FoodNStuff.addPositions([CompanyPositions.Employee]);
	AddToCompanies(FoodNStuff);
	
	var JoesGuns = new Company();
	JoesGuns.init("Joe's Guns", 1, 1);
	JoesGuns.addPositions([CompanyPositions.Employee]);
	AddToCompanies(JoesGuns);
	
	var OmegaSoftware = new Company();
	OmegaSoftware.init("Omega Software", 1.1, 1.1);
	OmegaSoftware.addPositions([
		CompanyPositions.SoftwareIntern, CompanyPositions.JuniorDev, CompanyPositions.SeniorDev,
		CompanyPositions.LeadDev, CompanyPositions.ITIntern, CompanyPositions.ITAnalyst,
		CompanyPositions.ITManager, CompanyPositions.CTO, CompanyPositions.CEO]);
	AddToCompanies(OmegaSoftware);
	
	/* Companies that do not have servers */
	var NoodleBar = new Company();
	NoodleBar.init("Noodle Bar", 1, 1);
	NoodleBar.addPositions([CompanyPositions.Waiter]);
	AddToCompanies(NoodleBar);
}

//Map of all companies that exist in the game, indexed by their name
Companies = {}

//Add a Company object onto the map of all Companies in the game
AddToCompanies = function (company) {
	var name = company.companyName;
	Companies[name] = company;
}