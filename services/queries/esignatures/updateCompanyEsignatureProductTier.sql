declare @_companyId int = @companyId

update
    dbo.Company
set
    ESignatureProductTierID = @esignatureProductTierId
where
    ID = @_companyId

-- select updated value for auditing
select
    ESignatureProductTierID
from
    dbo.Company
where
    ID = @_companyId