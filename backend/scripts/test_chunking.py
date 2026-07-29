from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]

DOCUMENT_PATH = (
    BACKEND_DIR
    / 'knowledge_docs'
    / 'running_shoes_sample.md'
)

text = DOCUMENT_PATH.read_text(encoding='utf-8')

parts = text.split('---', maxsplit=2)

if len(parts) == 3:
    content = parts[2].strip()
else:
    content = text.strip()

#print('Total characters:', len(content))
#print()
#print('First 300 characters:')
#print(content[:300])

blocks = content.split('\n\n')

chunks =[]

MAX_CHUNK_SIZE = 1000

# for index in range(0, len(blocks), 2):
#     heading = blocks[index]
#     related_content = blocks[index + 1]
#
#     chunk = heading + '\n\n' + related_content
#     chunks.append(chunk)
#
# for chunk in chunks:
#     assert len(chunk) <= MAX_CHUNK_SIZE, (
#         f'Chunk is too large: {len(chunk)} characters'
#     )

# Raw blocks are useful while debugging the first split.
# Uncomment this section when you want to inspect them again.
#
print()
print('Number of blocks:', len(blocks))

for index, block in enumerate(blocks):
    print()
    print(f'=== Block {index}: {len(block)} characters ===')
    print(block)


# print('Number of chunks:', len(chunks))
#
# for index, chunk in enumerate(chunks):
#     print()
#     print(f'=== chunks {index}: {len(chunk)} characters ===')
#     print(chunk)

print()
print('Headings found:')

for block in blocks:
    if block.startswith('#'):
        print(block)