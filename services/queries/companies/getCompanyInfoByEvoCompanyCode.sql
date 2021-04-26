select
    ID,
    PRIntegration_ClientID,
    CompanyName
from
    dbo.Company
where
    PRIntegrationCompanyCode = '@evoCompanyCode'