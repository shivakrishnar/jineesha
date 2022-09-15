declare @_relationship as nvarchar(50)
set @_relationship = '@relationship'

select
  brt.RelationshipType,
  eb.BirthDate,
  eb.IsSmoker
from EmployeeBeneficiary eb
join BeneficiaryRelationshipType brt
  on brt.ID = eb.BeneficiaryRelationshipTypeID
where eb.EmployeeID = @employeeId
  and (@_relationship = '' or brt.RelationshipType = @_relationship)