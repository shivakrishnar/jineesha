select top(1) PR_Integration_PK as WorkerCompTypeEvoId from dbo.WorkerCompType where CompanyID = @CompanyID and Code = @Code order by PR_Integration_PK desc
