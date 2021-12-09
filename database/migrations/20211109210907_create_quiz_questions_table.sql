-- migrate:up
create table if not exists upchieve.quiz_questions (
    id serial primary key,
    question_text text not null,
    possible_answers jsonb,
    correct_answer text not null,
    quiz_subcategory_id int not null references upchieve.quiz_subcategories (id),
    image_source text,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.quiz_questions cascade;

