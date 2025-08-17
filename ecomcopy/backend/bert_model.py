import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from transformers import BertTokenizer
import torch
from transformers import BertForSequenceClassification, Trainer, TrainingArguments

file_path = '/data/merged_amazon_flipkart_rowwise.csv'

# Load the dataset
df = pd.read_csv(file_path)
df = df[['Name', 'Description', 'Rating']]

# Combining 'Name' and 'Description' to create a single text field
df['text'] = df['Name'] + ". " + df['Description']

# Drop rows where the text is empty or NaN
df.dropna(subset=['text'], inplace=True)
# Encoding the rating column
label_encoder = LabelEncoder()
df['Rating'] = label_encoder.fit_transform(df['Rating'].astype(str))
 #Train-test split
train_texts, val_texts, train_labels, val_labels = train_test_split(df['text'], df['Rating'], test_size=0.2)
# Load BERT tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

# Tokenize the input texts
train_encodings = tokenizer(list(train_texts), truncation=True, padding=True, max_length=128)
val_encodings = tokenizer(list(val_texts), truncation=True, padding=True, max_length=128)


class Dataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

# Create the dataset
train_dataset = Dataset(train_encodings, list(train_labels))
val_dataset = Dataset(val_encodings, list(val_labels))

torch.cuda.is_available()
# Set device
device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')
# Load BERT for sequence classification
model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=len(label_encoder.classes_))
model.to(device)  # Move model to the correct device

# Set up training arguments
training_args = TrainingArguments(
    output_dir='./results',          # output directory
    num_train_epochs=3,              # number of training epochs
    per_device_train_batch_size=16,  # batch size for training
    per_device_eval_batch_size=64,   # batch size for evaluation
    warmup_steps=500,                # number of warmup steps for learning rate scheduler
    weight_decay=0.01,               # strength of weight decay
    logging_dir='./logs',            # directory for storing logs
    logging_steps=10,
)

# Initialize the Trainer
trainer = Trainer(
    model=model,                         # the instantiated  Transformers model to be trained
    args=training_args,                  # training arguments, defined above
    train_dataset=train_dataset,         # training dataset
    eval_dataset=val_dataset             # evaluation dataset
)

# Fine-tune the model
trainer.train()
