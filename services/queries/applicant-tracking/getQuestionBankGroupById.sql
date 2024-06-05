select
	qbg.ID as id,
	qbg.CompanyID as companyId,
	comp.CompanyName as companyName,
	qbg.GroupName as groupName
from
	ATQuestionBankGroup qbg inner join
	Company comp on qbg.CompanyID = comp.ID
where
	qbg.ID = @id
