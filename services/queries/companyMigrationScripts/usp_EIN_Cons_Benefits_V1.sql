/*-----------------------------------------------------------------
 usp_EIN_Cons_Benefits_V1
-----------------------------------------------------------------*/
/*
	Syntax	: exec  usp_EIN_Cons_Benefits_V1
		Ex.	: 	
			execute usp_EIN_Cons_Benefits_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'ShowData', 'a'
			execute usp_EIN_Cons_Benefits_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Insert', 'ZZZ'
			execute usp_EIN_Cons_Benefits_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'InsertFullValidate', 'ZZZ'
			execute usp_EIN_Cons_Benefits_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Delete', 'ZZZ'
		
	Purpose	:

	Params	: none. 
	Calls	: none.
	Returns	: none.
	Special	: none.
	Notes	: none.
	Author	: Tom Signor	Date : 07/16/21
	Notice	: Copyright (c) 2021 Asure Inc., All Rights Reserved.

	Last Mod	:
*/
/*-----------------------------------------------------------------*/
/*	First Drop Proc dbo.usp_EIN_Cons_Benefits_V1 */
	if object_id('dbo.usp_EIN_Cons_Benefits_V1') is not null
	begin
		drop procedure dbo.usp_EIN_Cons_Benefits_V1
		print 'Dropped Proc dbo.usp_EIN_Cons_Benefits_V1 '
	end
GO

	create procedure usp_EIN_Cons_Benefits_V1
	
		@cDonorDatabasePath		char(75),
		@cRecipientDatabasePath	char(75),
		@cVerbose_Ind			bit,
		@cShowStatement			bit,
		@cRecipientCompany_ID	char(8),
		@cDonorCompany_ID		char(8),
		@cValidateType_Cd		char(20),
		@cTableToRun			char(50)

	with encryption
	as

	--setup Exist vars
	declare @nDonorExistCount tinyint
	select @nDonorExistCount = 1
	declare @nRecipientExistCount tinyint
	select @nRecipientExistCount = 0
	declare @cDonorCountPath nvarchar(100)
	declare @cRecipientCountPath char(100)

	--setup Fail vars
	declare @cFailCodes char(256)
	select  @cFailCodes = ''

	declare @cmdColumns nvarchar(max)
	declare @cmdSelect nvarchar(max)
	declare @cmdInsert nvarchar(max)
	declare @cmdCombine nvarchar(max)
	declare @cmdCountDataDonor nvarchar(max)
	declare @cmdCountDataRecipient nvarchar(max)
	declare @cmdShowDataDonor nvarchar(max)
	declare @cmdShowDataRecipient nvarchar(max)
	declare @cDonorTablePath char(75)
	declare @cRecipientTablePath char(75)
	declare @cDonorCompanyID char(8)
	declare @cRecipientCompanyID char(8)

	select @cDonorTablePath = @cDonorDatabasePath --'[adhr-1].[dbo].'
	select @cRecipientTablePath = @cRecipientDatabasePath --'[adhr-2].[dbo].'

	set nocount on
	
	-- ------------------------------------------------------------
	-- This Query just returns the data from Donor system without verifiyng or moving anything
	if @cValidateType_Cd = 'ShowData'
	
	begin
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%A%'
		begin
			select @cmdShowDataRecipient = '
				select
					'+@cRecipientCompany_ID+' as CompanyID,
					donor_bp.Code,
					donor_bp.Description,
					donor_bp.PolicyNumber,
					donor_bp.AlternateID, -- this is not an FK
					donor_bp.ProducerCode,
					-- TODO: (MJ-9231) we cannot guarantee uniqueness for these fields so they may result in duplicate records being inserted
					-- NULL them for now
					null as GeneralAgentID,
					null as CarrierID,
					recip_bpt.ID as PlanTypeID,
					null as CoverageStartTypeID,
					donor_bp.StartDate,
					donor_bp.EndDate,
					donor_bp.RenewalDate,
					donor_bp.EmployerDeductionCode,
					donor_bp.EmployeeDeductionCode,
					donor_bp.Notes,
					donor_bp.Priority,
					donor_bp.Active,
					donor_bp.CodeToIndicateDollarAmount,
					donor_bp.CodeToIndicatePercentageAmount,
					donor_bp.WebsiteURL,
					donor_bp.WebsiteUserID,
					donor_bp.WebsitePassword,
					donor_bp.RateStructureID, -- this is not an FK
					donor_bp.ContributionTypeID, -- not an fk
					donor_bp.ContributionValueID, -- not an fk
					donor_bp.EligibilityTypeID, -- not an fk
					donor_bp.DeductionFrequencyCode,
					donor_bp.UsedForACA,
					donor_bp.SelfInsured,
					donor_bp.ACALowestCost,
					donor_bp.PR_Integration_PK,
					donor_bp.EvoFK_CompanyBenefitPlanSubtypeID,
					donor_bp.EvoFK_CompanyBenefitPlanRateID,
					donor_bp.EvoFK_CompanyBenefitPlanStateID,
					donor_bp.IncludeADD,
					donor_bp.RequireEnrollment,
					donor_bp.RequireBeneficiary,
					donor_bp.LifeIsAgeReductions,
					donor_bp.LifeBenefitType,
					donor_bp.LifeGuaranteedIssueType,
					donor_bp.LifeBenefitAmount,
					donor_bp.LifeGuaranteedIssueAmount,
					donor_bp.LifeMultipleOfEarnings,
					donor_bp.LifeBenefitMinimum,
					donor_bp.LifeBenefitMaximum,
					donor_bp.LifeRoundingType,
					donor_bp.ADDRate,
					donor_bp.LifeEmployerContributionPercent,
					donor_bp.CustomPlanType,
					donor_bp.IsCOBRAEligible,
					donor_bp.EmployerFSAAnnualContributionAmount,
					donor_bp.AnnualFSALimit,
					donor_bp.AnnualLimitedFSALimit,
					donor_bp.DisabilityPercentOfMonthlyOrWeeklyEarnings,
					donor_bp.AnnualDCALimit,
					donor_bp.LifeEmployerContributionLimit,
					donor_bp.EmployerFamilyDeductionCode,
					donor_bp.EmployerSingleDeductionCode,
					donor_bp.EmployerFamilyCatchUpDeductionCode,
					donor_bp.EmployerSingleCatchUpDeductionCode,
					donor_bp.EmployeeFamilyDeductionCode,
					donor_bp.EmployeeSingleDeductionCode,
					donor_bp.EmployeeCatchUpDeductionCode,
					donor_bp.AnnualHSAEmployerContributionFamily,
					donor_bp.AnnualHSAEmployerContributionSingle,
					donor_bp.AnnualHSALimitSingle,
					donor_bp.AnnualHSALimitFamily,
					donor_bp.AnnualHSAEmployerCatchUpContribution,
					donor_bp.AnnualHSACatchUpLimit,
					null as RelatedPlanID, -- see TODO above
					donor_bp.BankAccountProvided,
					donor_bp.Instructions,
					donor_bp.Details,
					donor_bp.VoluntaryLifeIncrement,
					donor_bp.LifeIncrementIncomeFrequency,
					donor_bp.LifeRoundingIncrement,
					donor_bp.LifeEmployeeContributionPercent,
					donor_bp.IncludeAgeReductionPolicy,
					donor_bp.ADDRequiresElection,
					donor_bp.CoverageAmountTypeID, -- not an fk, bring over as is
					donor_bp.DependentVoluntaryLifeRate,
					donor_bp.ADDDRateFromRelatedPlan,
					donor_bp.IsCovarageAmountRelated,
					donor_bp.ProrateContributions,
					donor_bp.LimitedFSAOption
				from '+trim(@cDonorTablePath)+'BenefitPlan donor_bp

				-- left join dbo.BenefitGeneralAgent donor_bga on donor_bga.ID = donor_bp.GeneralAgentID
				-- left join dbo.BenefitGeneralAgentContact donor_bgac on donor_bgac.BenefitGeneralAgentID = donor_bga.ID
				-- left join dbo.BenefitGeneralAgentContact recip_bgac on
				--     isnull(recip_bgac.ContactType, 0) = isnull(donor_bgac.ContactType, 0) and
				--     isnull(recip_bgac.FirstName, 0) = isnull(donor_bgac.FirstName, 0) and
				--     isnull(recip_bgac.LastName, 0) = isnull(donor_bgac.LastName, 0) and
				--     isnull(recip_bgac.EmailAddress, 0) = isnull(donor_bgac.EmailAddress, 0) and
				--     isnull(recip_bgac.PhoneWork, 0) = isnull(donor_bgac.PhoneWork, 0) and
				--     isnull(recip_bgac.PhoneCell, 0) = isnull(donor_bgac.PhoneCell, 0) and
				--     isnull(recip_bgac.PhoneHome, 0) = isnull(donor_bgac.PhoneHome, 0)
				-- left join dbo.BenefitGeneralAgent recip_bga on
				--     recip_bga.CompanyID = donor_bga.CompanyID and
				--     recip_bga.CompanyName = donor_bga.CompanyName and
				--     recip_bga.ID = recip_bgac.BenefitGeneralAgentID

				join '+trim(@cDonorTablePath)+'BenefitPlanType donor_bpt on donor_bpt.ID = donor_bp.PlanTypeID
				join '+trim(@cRecipientTablePath)+'BenefitPlanType recip_bpt on recip_bpt.Code = donor_bpt.Code and recip_bpt.Description = donor_bpt.Description

				where donor_bp.CompanyID = '+@cDonorCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlan - A' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			select @cmdShowDataRecipient = 'select R1.ID, T1.*
			from '+trim(@cDonorTablePath)+'BenefitPlanAgeBand T1

			left outer join '+trim(@cDonorTablePath)+'BenefitPlan D1 on D1.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R1 on R1.Code = D1.Code and isnull(R1.StartDate, '''') = isnull(D1.StartDate, '''') and isnull(R1.EndDate, '''') = isnull(D1.EndDate, '''')

			where D1.CompanyID = '+@cDonorCompany_ID +' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlanAgeBand - B' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			select @cmdShowDataRecipient = '
			select
				R1.ID as PlanID,
				R2.ID as CoverageTypeID,
				T1.Premium,
				T1.EmployerAmount,
				T1.EmployerPercent,
				T1.EmployeeAmount,
				T1.EmployeePercent,
				T1.IsOffered,
				T1.IsAdditional,
				T1.PR_Integration_PK,
				T1.IsACALowestCost,
				T1.EvoFK_BenefitPlanSubtype
			from '+trim(@cDonorTablePath)+'BenefitPlanRate T1

			left outer join '+trim(@cDonorTablePath)+'BenefitPlan D1 on D1.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R1 on R1.Code = D1.Code and R1.Description = D1.Description and isnull(R1.StartDate, '''') = isnull(D1.StartDate, '''') and isnull(R1.EndDate, '''') = isnull(D1.EndDate, '''')

			join '+trim(@cDonorTablePath)+'BenefitCoverageType D2 on D2.ID = T1.CoverageTypeID
			join '+trim(@cRecipientTablePath)+'BenefitCoverageType R2 on R2.Code = D2.Code and R2.Description = D2.Description

			where D1.CompanyID = '+@cDonorCompany_ID +' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlanRate - C' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
			select @cmdShowDataRecipient = 'select R1.ID, T1.*
			from '+trim(@cDonorTablePath)+'BenefitPlanFrequencyOverride T1

			left outer join '+trim(@cDonorTablePath)+'BenefitPlan D1 on D1.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R1 on R1.Code = D1.Code and isnull(R1.StartDate, '''') = isnull(D1.StartDate, '''') and isnull(R1.EndDate, '''') = isnull(D1.EndDate, '''')

			where D1.CompanyID = '+@cDonorCompany_ID +' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlanFrequencyOverride - D' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
		begin
			--SecRole Ready
			select @cmdShowDataRecipient = 'select R1.ID as PlanID, R2.ID as ClassID
			from '+trim(@cDonorTablePath)+'BenefitPlanClass T1

			left outer join '+trim(@cDonorTablePath)+'BenefitPlan D1 on D1.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R1 on R1.Code = D1.Code and isnull(R1.StartDate, '''') = isnull(D1.StartDate, '''') and isnull(R1.EndDate, '''') = isnull(D1.EndDate, '''')

			join '+trim(@cDonorTablePath)+'BenefitClass D2 on D2.ID = T1.ClassID
			join '+trim(@cRecipientTablePath)+'BenefitClass R2 on R2.Code = D2.Code and R2.Description = D2.Description and R2.CompanyID = R1.CompanyID

			where D1.CompanyID = '+@cDonorCompany_ID +' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlanClass - E' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		begin
			--SecRole Ready
			select @cmdShowDataRecipient = 'select R1.ID, T1.*
			from '+trim(@cDonorTablePath)+'BenefitPlanTieredCoverageAmount T1

			left outer join '+trim(@cDonorTablePath)+'BenefitPlan D1 on D1.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R1 on R1.Code = D1.Code and isnull(R1.StartDate, '''') = isnull(D1.StartDate, '''') and isnull(R1.EndDate, '''') = isnull(D1.EndDate, '''')

			where D1.CompanyID = '+@cDonorCompany_ID +' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlanTieredCoverageAmount - F' as Showdata
			end
		end

		select @cFailCodes = 'ShowData'
	
	end

	-- ------------------------------------------------------------
	-- These Queries determine wether an insert should continue
	if @nDonorExistCount = 0 
		select @cFailCodes = 'NoDonorExists', @cValidateType_Cd = 'ExitPGM'
	if @nRecipientExistCount > 0 
		select @cFailCodes = 'RecipientExists', @cValidateType_Cd = 'ExitPGM'

	-- This Query loads the data from Donor
	if @cValidateType_Cd = 'Insert'
	
	begin

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%A%'
		begin
			select @cmdInsert = '
			insert into '+trim(@cRecipientTablePath)+'BenefitPlan (
				CompanyID,
				Code,
				Description,
				PolicyNumber,
				AlternateID,
				ProducerCode,
				GeneralAgentID,
				CarrierID,
				PlanTypeID,
				CoverageStartTypeID,
				StartDate,
				EndDate,
				RenewalDate,
				EmployerDeductionCode,
				EmployeeDeductionCode,
				Notes,
				Priority,
				Active,
				CodeToIndicateDollarAmount,
				CodeToIndicatePercentageAmount,
				WebsiteURL,
				WebsiteUserID,
				WebsitePassword,
				RateStructureID,
				ContributionTypeID,
				ContributionValueID,
				EligibilityTypeID,
				DeductionFrequencyCode,
				UsedForACA,
				SelfInsured,
				ACALowestCost,
				PR_Integration_PK,
				EvoFK_CompanyBenefitPlanSubtypeID,
				EvoFK_CompanyBenefitPlanRateID,
				EvoFK_CompanyBenefitPlanStateID,
				IncludeADD,
				RequireEnrollment,
				RequireBeneficiary,
				LifeIsAgeReductions,
				LifeBenefitType,
				LifeGuaranteedIssueType,
				LifeBenefitAmount,
				LifeGuaranteedIssueAmount,
				LifeMultipleOfEarnings,
				LifeBenefitMinimum,
				LifeBenefitMaximum,
				LifeRoundingType,
				ADDRate,
				LifeEmployerContributionPercent,
				CustomPlanType,
				IsCOBRAEligible,
				EmployerFSAAnnualContributionAmount,
				AnnualFSALimit,
				AnnualLimitedFSALimit,
				DisabilityPercentOfMonthlyOrWeeklyEarnings,
				AnnualDCALimit,
				LifeEmployerContributionLimit,
				EmployerFamilyDeductionCode,
				EmployerSingleDeductionCode,
				EmployerFamilyCatchUpDeductionCode,
				EmployerSingleCatchUpDeductionCode,
				EmployeeFamilyDeductionCode,
				EmployeeSingleDeductionCode,
				EmployeeCatchUpDeductionCode,
				AnnualHSAEmployerContributionFamily,
				AnnualHSAEmployerContributionSingle,
				AnnualHSALimitSingle,
				AnnualHSALimitFamily,
				AnnualHSAEmployerCatchUpContribution,
				AnnualHSACatchUpLimit,
				RelatedPlanID,
				BankAccountProvided,
				Instructions,
				Details,
				VoluntaryLifeIncrement,
				LifeIncrementIncomeFrequency,
				LifeRoundingIncrement,
				LifeEmployeeContributionPercent,
				IncludeAgeReductionPolicy,
				ADDRequiresElection,
				CoverageAmountTypeID,
				DependentVoluntaryLifeRate,
				ADDDRateFromRelatedPlan,
				IsCovarageAmountRelated,
				ProrateContributions,
				LimitedFSAOption
			)
			select
				'+@cRecipientCompany_ID+' as CompanyID,
				donor_bp.Code,
				donor_bp.Description,
				donor_bp.PolicyNumber,
				donor_bp.AlternateID, -- this is not an FK
				donor_bp.ProducerCode,
				-- TODO: (MJ-9231) we cannot guarantee uniqueness for these fields so they may result in duplicate records being inserted
				-- NULL them for now
				null as GeneralAgentID,
				null as CarrierID,
				recip_bpt.ID as PlanTypeID,
				null as CoverageStartTypeID,
				donor_bp.StartDate,
				donor_bp.EndDate,
				donor_bp.RenewalDate,
				donor_bp.EmployerDeductionCode,
				donor_bp.EmployeeDeductionCode,
				donor_bp.Notes,
				donor_bp.Priority,
				donor_bp.Active,
				donor_bp.CodeToIndicateDollarAmount,
				donor_bp.CodeToIndicatePercentageAmount,
				donor_bp.WebsiteURL,
				donor_bp.WebsiteUserID,
				donor_bp.WebsitePassword,
				donor_bp.RateStructureID, -- this is not an FK
				donor_bp.ContributionTypeID, -- not an fk
				donor_bp.ContributionValueID, -- not an fk
				donor_bp.EligibilityTypeID, -- not an fk
				donor_bp.DeductionFrequencyCode,
				donor_bp.UsedForACA,
				donor_bp.SelfInsured,
				donor_bp.ACALowestCost,
				donor_bp.PR_Integration_PK,
				donor_bp.EvoFK_CompanyBenefitPlanSubtypeID,
				donor_bp.EvoFK_CompanyBenefitPlanRateID,
				donor_bp.EvoFK_CompanyBenefitPlanStateID,
				donor_bp.IncludeADD,
				donor_bp.RequireEnrollment,
				donor_bp.RequireBeneficiary,
				donor_bp.LifeIsAgeReductions,
				donor_bp.LifeBenefitType,
				donor_bp.LifeGuaranteedIssueType,
				donor_bp.LifeBenefitAmount,
				donor_bp.LifeGuaranteedIssueAmount,
				donor_bp.LifeMultipleOfEarnings,
				donor_bp.LifeBenefitMinimum,
				donor_bp.LifeBenefitMaximum,
				donor_bp.LifeRoundingType,
				donor_bp.ADDRate,
				donor_bp.LifeEmployerContributionPercent,
				donor_bp.CustomPlanType,
				donor_bp.IsCOBRAEligible,
				donor_bp.EmployerFSAAnnualContributionAmount,
				donor_bp.AnnualFSALimit,
				donor_bp.AnnualLimitedFSALimit,
				donor_bp.DisabilityPercentOfMonthlyOrWeeklyEarnings,
				donor_bp.AnnualDCALimit,
				donor_bp.LifeEmployerContributionLimit,
				donor_bp.EmployerFamilyDeductionCode,
				donor_bp.EmployerSingleDeductionCode,
				donor_bp.EmployerFamilyCatchUpDeductionCode,
				donor_bp.EmployerSingleCatchUpDeductionCode,
				donor_bp.EmployeeFamilyDeductionCode,
				donor_bp.EmployeeSingleDeductionCode,
				donor_bp.EmployeeCatchUpDeductionCode,
				donor_bp.AnnualHSAEmployerContributionFamily,
				donor_bp.AnnualHSAEmployerContributionSingle,
				donor_bp.AnnualHSALimitSingle,
				donor_bp.AnnualHSALimitFamily,
				donor_bp.AnnualHSAEmployerCatchUpContribution,
				donor_bp.AnnualHSACatchUpLimit,
				null as RelatedPlanID, -- see TODO above
				donor_bp.BankAccountProvided,
				donor_bp.Instructions,
				donor_bp.Details,
				donor_bp.VoluntaryLifeIncrement,
				donor_bp.LifeIncrementIncomeFrequency,
				donor_bp.LifeRoundingIncrement,
				donor_bp.LifeEmployeeContributionPercent,
				donor_bp.IncludeAgeReductionPolicy,
				donor_bp.ADDRequiresElection,
				donor_bp.CoverageAmountTypeID, -- not an fk, bring over as is
				donor_bp.DependentVoluntaryLifeRate,
				donor_bp.ADDDRateFromRelatedPlan,
				donor_bp.IsCovarageAmountRelated,
				donor_bp.ProrateContributions,
				donor_bp.LimitedFSAOption
			from '+trim(@cDonorTablePath)+'BenefitPlan donor_bp

			-- left join dbo.BenefitGeneralAgent donor_bga on donor_bga.ID = donor_bp.GeneralAgentID
			-- left join dbo.BenefitGeneralAgentContact donor_bgac on donor_bgac.BenefitGeneralAgentID = donor_bga.ID
			-- left join dbo.BenefitGeneralAgentContact recip_bgac on
			--     isnull(recip_bgac.ContactType, 0) = isnull(donor_bgac.ContactType, 0) and
			--     isnull(recip_bgac.FirstName, 0) = isnull(donor_bgac.FirstName, 0) and
			--     isnull(recip_bgac.LastName, 0) = isnull(donor_bgac.LastName, 0) and
			--     isnull(recip_bgac.EmailAddress, 0) = isnull(donor_bgac.EmailAddress, 0) and
			--     isnull(recip_bgac.PhoneWork, 0) = isnull(donor_bgac.PhoneWork, 0) and
			--     isnull(recip_bgac.PhoneCell, 0) = isnull(donor_bgac.PhoneCell, 0) and
			--     isnull(recip_bgac.PhoneHome, 0) = isnull(donor_bgac.PhoneHome, 0)
			-- left join dbo.BenefitGeneralAgent recip_bga on
			--     recip_bga.CompanyID = donor_bga.CompanyID and
			--     recip_bga.CompanyName = donor_bga.CompanyName and
			--     recip_bga.ID = recip_bgac.BenefitGeneralAgentID

			join '+trim(@cDonorTablePath)+'BenefitPlanType donor_bpt on donor_bpt.ID = donor_bp.PlanTypeID
			join '+trim(@cRecipientTablePath)+'BenefitPlanType recip_bpt on recip_bpt.Code = donor_bpt.Code and recip_bpt.Description = donor_bpt.Description

			where donor_bp.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlan - A' as Insertdata
			end
		end

		--select ID from [adhr-1].[dbo].Employee where CompanyID = @cDonorCompany_ID
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'BenefitPlanAgeBand (PlanID, LowAge, HighAge, Premium, SmokerPremium)
			select R1.ID, T1.LowAge, T1.HighAge, T1.Premium, T1.SmokerPremium
			from '+trim(@cDonorTablePath)+'BenefitPlanAgeBand T1

			left outer join '+trim(@cDonorTablePath)+'BenefitPlan D1 on D1.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R1 on R1.Code = D1.Code and isnull(R1.StartDate, '''') = isnull(D1.StartDate, '''') and isnull(R1.EndDate, '''') = isnull(D1.EndDate, '''')

			where D1.CompanyID = '+@cDonorCompany_ID +' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlanAgeBand - B' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'BenefitPlanRate (
				PlanID,
				CoverageTypeID,
				Premium,
				EmployerAmount,
				EmployerPercent,
				EmployeeAmount,
				EmployeePercent,
				IsOffered,
				IsAdditional,
				PR_Integration_PK,
				IsACALowestCost,
				EvoFK_BenefitPlanSubtype
			)
			select
				R1.ID as PlanID,
				R2.ID as CoverageTypeID,
				T1.Premium,
				T1.EmployerAmount,
				T1.EmployerPercent,
				T1.EmployeeAmount,
				T1.EmployeePercent,
				T1.IsOffered,
				T1.IsAdditional,
				T1.PR_Integration_PK,
				T1.IsACALowestCost,
				T1.EvoFK_BenefitPlanSubtype
			from '+trim(@cDonorTablePath)+'BenefitPlanRate T1

			left outer join '+trim(@cDonorTablePath)+'BenefitPlan D1 on D1.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R1 on R1.Code = D1.Code and R1.Description = D1.Description and isnull(R1.StartDate, '''') = isnull(D1.StartDate, '''') and isnull(R1.EndDate, '''') = isnull(D1.EndDate, '''')

			join '+trim(@cDonorTablePath)+'BenefitCoverageType D2 on D2.ID = T1.CoverageTypeID
			join '+trim(@cRecipientTablePath)+'BenefitCoverageType R2 on R2.Code = D2.Code and R2.Description = D2.Description

			where D1.CompanyID = '+@cDonorCompany_ID +' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlanRate - C' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'BenefitPlanFrequencyOverride (PlanID, FrequencyCode, PaysPerYear)
			select R1.ID, T1.FrequencyCode, T1.PaysPerYear
			from '+trim(@cDonorTablePath)+'BenefitPlanFrequencyOverride T1

			left outer join '+trim(@cDonorTablePath)+'BenefitPlan D1 on D1.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R1 on R1.Code = D1.Code and isnull(R1.StartDate, '''') = isnull(D1.StartDate, '''') and isnull(R1.EndDate, '''') = isnull(D1.EndDate, '''')

			where D1.CompanyID = '+@cDonorCompany_ID +' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlanFrequencyOverride - D' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
		begin

			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'BenefitPlanClass (PlanID, ClassID)
			select R1.ID as PlanID, R2.ID as ClassID
			from '+trim(@cDonorTablePath)+'BenefitPlanClass T1

			left outer join '+trim(@cDonorTablePath)+'BenefitPlan D1 on D1.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R1 on R1.Code = D1.Code and isnull(R1.StartDate, '''') = isnull(D1.StartDate, '''') and isnull(R1.EndDate, '''') = isnull(D1.EndDate, '''')

			join '+trim(@cDonorTablePath)+'BenefitClass D2 on D2.ID = T1.ClassID
			join '+trim(@cRecipientTablePath)+'BenefitClass R2 on R2.Code = D2.Code and R2.Description = D2.Description and R2.CompanyID = R1.CompanyID

			where D1.CompanyID = '+@cDonorCompany_ID +' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlanClass - E' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		begin

			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'BenefitPlanTieredCoverageAmount (PlanID, Amount)
			select R1.ID, T1.Amount
			from '+trim(@cDonorTablePath)+'BenefitPlanTieredCoverageAmount T1

			left outer join '+trim(@cDonorTablePath)+'BenefitPlan D1 on D1.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R1 on R1.Code = D1.Code and isnull(R1.StartDate, '''') = isnull(D1.StartDate, '''') and isnull(R1.EndDate, '''') = isnull(D1.EndDate, '''')

			where D1.CompanyID = '+@cDonorCompany_ID +' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlanTieredCoverageAmount - F' as Insertdata
			end
		end

		select  @cFailCodes = 'Insert'

	end

	-- This Query verifies and loads the data from Donor

	if @cValidateType_Cd = 'InsertFullValidate'
	
	begin

		select  @cFailCodes = 'InsertFullValidate Not Available At This Time'
				
	end

	-- This Query deletes the data from Receiver system
	if @cValidateType_Cd = 'Delete'
	
	begin

		--This is the Recipient table
		--select @cmdShowDataDonor = 'delete from '+trim(@cRecipientTablePath)+trim(@cTableName)+' where CompanyID = '+@cRecipientCompany_ID
		--exec (@cmdShowDataDonor)
		select  @cFailCodes = 'Delete Not Available At This Time'
	
	end
	
	select @cFailCodes as 'Return Code'

ExitPgm:
return 0
GO

/*	Now check to make sure it has been created (dbo.usp_EIN_Cons_Benefits_V1 ) */ 
	if object_id('dbo.usp_EIN_Cons_Benefits_V1') is not null
		print 'Proc dbo.usp_EIN_Cons_Benefits_V1 has been CREATED Successfully. '
	else
		print 'Create Proc dbo.usp_EIN_Cons_Benefits_V1 FAILED'
GO

/*	now Grant Permissions on dbo.usp_EIN_Cons_Benefits_V1 to public */
	grant execute on dbo.usp_EIN_Cons_Benefits_V1 to public
	print 'Execute rights have been GRANTED to group public on usp_EIN_Cons_Benefits_V1'
GO
  
/*-----------------------------------------------------------------
	eof -  usp_EIN_Cons_Benefits_V1.sql 
-----------------------------------------------------------------*/