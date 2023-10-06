-- Uncomment the line with CompanyID to turn this query by Company
DECLARE @Result NVARCHAR(1) = 'N';

SET @Result = CASE WHEN EXISTS(
	SELECT 1
	FROM 
		dbo.BetaFlag bf INNER JOIN
		dbo.BetaFlagType bft ON bf.BetaFlagTypeID = bft.ID
	WHERE
		bft.Code = 'Nacha'
	AND bf.IsOn = 1
	--AND bf.CompanyID = @CompanyID
) THEN 'Y' ELSE 'N' END

SELECT @Result AS Result