select 
	CompanyName,
	ClientID = PRIntegration_ClientID,
	MatchingUrls
from
	dbo.Company
	cross apply (
			select top 1   -- intentional safeguard against multiple accounts 
				MatchingURLs
			from 
				dbo.HRnextAccount 
		) baseUrls
where
	ID = @companyId