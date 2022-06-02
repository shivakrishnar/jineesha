SELECT
    cb.EmployeeBenefitID,
    eb.FirstName,
    eb.LastName,
    brt.RelationshipType,
	cb.IsPrimary,
    eb.IsSmoker,
    eb.BirthDate
FROM
    dbo.CoveredBeneficiary cb
LEFT JOIN dbo.EmployeeBeneficiary eb ON eb.ID = cb.EmployeeBeneficiaryID 
LEFT JOIN dbo.BeneficiaryRelationshipType brt ON brt.ID = eb.BeneficiaryRelationshipTypeID
WHERE
   eb.EmployeeID = @employeeId
