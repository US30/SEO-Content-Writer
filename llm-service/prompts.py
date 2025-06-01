# Define prompts for each content step

def get_keywords_prompt(seed):
    return f"Suggest 5 SEO keywords related to '{seed}'."

def get_titles_prompt(keyword):
    return f"Generate 3 SEO-optimized blog titles for the keyword '{keyword}'."

def get_topics_prompt(title):
    return f"Suggest 2 topic ideas or an outline for the blog title '{title}'."

def get_content_prompt(topic, keyword):
    return f"Write a 150-word SEO-optimized introduction for '{topic}' using the keyword '{keyword}'."