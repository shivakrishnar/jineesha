select top(1) PR_Integration_PK as PositionTypeEvoId from dbo.PositionType where CompanyID = @CompanyID and Code = @Code order by PR_Integration_PK desc
