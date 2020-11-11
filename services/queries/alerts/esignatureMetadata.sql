select
    ee.FirstName,
    c.CompanyName,
    em.Title
from
    dbo.EsignatureMetadata em
inner join dbo.Employee ee on ee.EmployeeCode = em.EmployeeCode
inner join dbo.Company c on c.ID = ee.CompanyID
where
    em.ID = '@esignatureMetadataId' and
    c.ID = @companyId and
    ee.EmployeeCode = '@employeeCode'