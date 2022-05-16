SELECT
    cd.EmployeeBenefitID,
    ed.FirstName,
    ed.LastName,
    drt.RelationshipType
FROM
    dbo.CoveredDependent cd
LEFT JOIN dbo.EmployeeDependent ed ON ed.ID = cd.EmployeeDependentID 
LEFT JOIN dbo.DependentRelationshipType drt ON drt.ID = ed.DependentRelationshipTypeID
WHERE
   ed.EmployeeID = @employeeId