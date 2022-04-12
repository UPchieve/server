/* @name getZipCodeByZipCode */
SELECT
    code AS zip_code,
    income AS median_income,
    income <= :medianIncomeThreshold! AS is_eligible
FROM
    postal_codes
WHERE
    code = :zipCode!;

