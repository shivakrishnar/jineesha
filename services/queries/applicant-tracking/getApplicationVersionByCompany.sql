select 
	appVer.ID as id,
	appVer.CompanyID as companyId,
	comp.CompanyName as companyName,
	appVer.Title as title,
	appVer.Description as description,
	appVer.KeywordList as keywordList,
	appVer.ATApplicationVersionDate as aTApplicationVersionDate,
	appVer.IsSectionOnEmploymentHistory as isSectionOnEmploymentHistory,
	appVer.IsSectionOnEducationHistory as isSectionOnEducationHistory,
	appVer.IsSectionOnWorkConditions as isSectionOnWorkConditions,
	appVer.IsSectionOnKeywords as isSectionOnKeywords,
	appVer.IsSectionOnDocuments as isSectionOnDocuments,
	appVer.IsSectionOnCertification as isSectionOnCertification,
	appVer.IsSectionOnPayHistory as isSectionOnPayHistory,
	appVer.JazzHrPositionOpeningID as jazzHrPositionOpeningID
from 
	ATApplicationVersion appVer inner join 
	Company comp on comp.id = appVer.CompanyID
where 
	appVer.CompanyID in(select * from dbo.SplitString(@CompanyID, '-'))
order by
	comp.CompanyName,
	appVer.Title,
	appVer.ID