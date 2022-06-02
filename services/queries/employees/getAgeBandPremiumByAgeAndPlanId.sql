declare @_age as int = @age

select
	Premium,
	SmokerPremium
from
	dbo.BenefitPlanAgeBand
where
	@_age >= LowAge AND @_age <= HighAge AND PlanID = @planId