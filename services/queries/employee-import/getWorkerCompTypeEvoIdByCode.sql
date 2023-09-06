select top(1) PR_Integration_PK as WorkerCompTypeEvoId 
from dbo.WorkerCompType 
where CompanyID = @CompanyID and 
      Code = @Code and
      CountryStateTypeID = (select ID from dbo.CountryStateType where StateCode = @StateCode)
order by PR_Integration_PK desc
