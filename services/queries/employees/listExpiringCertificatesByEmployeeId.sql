declare @landingSectionHistoryInMonths as int, @_companyId as int = @companyId, @_employeeId as int = @employeeId

set @landingSectionHistoryInMonths = (select LandingSectionHistoryInMonths from Company where ID = @_companyId)

-- Get total count for pagination
select count(*) as totalCount from EmployeeCertificate as cl
left join CertificateType as ct
on cl.CertificateTypeID = ct.ID
where EmployeeID = @_employeeId
and ExpirationDate <= convert(date, DATEADD(month, @landingSectionHistoryInMonths, GETDATE()))
and ExpirationDate >= convert(date, GETDATE())

select cl.*, ct.CompanyID, ct.Code, ct.Description, ct.Priority, ct.Active from EmployeeCertificate as cl
left join CertificateType as ct
on cl.CertificateTypeID = ct.ID
where EmployeeID = @_employeeId
and ExpirationDate <= convert(date, DATEADD(month, @landingSectionHistoryInMonths, GETDATE()))
and ExpirationDate >= convert(date, GETDATE())
order by ExpirationDate