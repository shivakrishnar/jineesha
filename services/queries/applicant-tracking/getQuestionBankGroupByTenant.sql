declare @_searchBy nvarchar(50) = @searchBy

select
	count(*) as totalCount
from
	ATQuestionBankGroup qbg inner join
	Company comp on qbg.CompanyID = comp.ID
where
	concat(comp.CompanyName, qbg.GroupName) like '%' + @_searchBy + '%'

select
	qbg.ID as id,
	qbg.CompanyID as companyId,
	comp.CompanyName as companyName,
	qbg.GroupName as groupName
from
	ATQuestionBankGroup qbg inner join
	Company comp on qbg.CompanyID = comp.ID
where
	concat(comp.CompanyName, qbg.GroupName) like '%' + @_searchBy + '%'
order by
	comp.CompanyName,
	qbg.GroupName,
	qbg.ID
