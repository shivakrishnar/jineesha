declare @_employeeId as int = @employeeId

-- Get total count for pagination
select count(*) as totalCount from EmployeeCertificate as cl
left join CertificateType as ct
on cl.CertificateTypeID = ct.ID
where EmployeeID = @_employeeId

select cl.*, ct.CompanyID, ct.Code, ct.Description, ct.Priority, ct.Active from EmployeeCertificate as cl
left join CertificateType as ct
on cl.CertificateTypeID = ct.ID
where EmployeeID = @_employeeId
order by IssuedDate