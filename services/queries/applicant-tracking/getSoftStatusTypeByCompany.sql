select 
	atSST.ID,  
	atSST.CompanyID as companyId,
	c.CompanyName as companyName,
	atSST.ATHardStatusTypeID as atHardStatusId,
	atSST.Title as title,
	atSST.Description as description,
	atSST.Sequence as sequence
from 
	ATSoftStatusType atSST inner join 
	Company c on c.id = atSST.CompanyID
where 
	atSST.CompanyID in(select * from dbo.SplitString(@CompanyID, '-'))
order by
	c.CompanyName,
	atSST.Sequence,
	atSST.Title