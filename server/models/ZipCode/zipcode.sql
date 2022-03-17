/* @name getZipCodeByZipCode */
SELECT
    code AS zip_code,
    income AS median_income,
    income >= 60000 AS is_eligible
FROM
    postal_codes
WHERE
    code = :zipCode!;

