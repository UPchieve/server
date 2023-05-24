/* @name getZipCodeByZipCode */
SELECT
    code AS zip_code,
    income AS median_income,
    cbsa_income,
    state_income,
    (income <= GREATEST (COALESCE(cbsa_income, 0) * 0.8, COALESCE(state_income, 0) * 0.8)
        OR income <= :medianIncomeThreshold!) AS is_eligible,
    income <= :medianIncomeThreshold! AS is_eligible_old
FROM
    postal_codes
WHERE
    code = :zipCode!;


/* @name upsertZipCode */
INSERT INTO postal_codes (code, us_state_code, income, LOCATION, created_at, updated_at)
    VALUES (:code!, :usStateCode!, :income!, POINT(:latitude!, :longitude!), NOW(), NOW())
ON CONFLICT (code)
    DO UPDATE SET
        income = :income!, LOCATION = POINT(:latitude!, :longitude!), updated_at = NOW()
    WHERE
        postal_codes.code = :code!
    RETURNING
        postal_codes.code AS ok;

