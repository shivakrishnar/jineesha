select 
	 AccountName,
	 TenantUrls = MatchingUrls,
	 ContactFirstName = PrimaryContactFirstName,
	 ContactLastName = PrimaryContactLastName,
	 ContactEmailAddress = PrimaryContactEMail
from
	dbo.HRnextAccount
where
	isActive = 1