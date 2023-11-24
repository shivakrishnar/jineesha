select bf.ID, bf.CompanyID, bf.IsOn, bft.Code
from BetaFlag bf
		inner join BetaFlagType bft on bf.BetaFlagTypeID = bft.ID